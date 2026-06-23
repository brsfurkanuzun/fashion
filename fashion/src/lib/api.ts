const PROD_HOSTS = new Set(['design.nulatechnology.com', 'www.design.nulatechnology.com'])

const RAILWAY_API = 'https://fashion-production-bc9c.up.railway.app'

function trimBase(url: string) {
  return url.replace(/\/$/, '')
}

function envApiBase(): string {
  return trimBase(import.meta.env.VITE_API_BASE_URL ?? '')
}

function isProdHost(): boolean {
  return typeof window !== 'undefined' && PROD_HOSTS.has(window.location.hostname)
}

/** Canlıda önce aynı domain /api (htaccess proxy), sonra Railway. */
export function getApiBaseCandidates(): string[] {
  const env = envApiBase()
  if (isProdHost()) {
    const out = ['']
    if (env) out.push(env)
    else out.push(RAILWAY_API)
    return [...new Set(out)]
  }
  return env ? [env] : ['']
}

export const API_BASE_URL = envApiBase()

export function apiUrl(path: string, base = getApiBaseCandidates()[0]) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

function looksLikeSpaHtml(res: Response): boolean {
  const ct = res.headers.get('content-type') ?? ''
  return ct.includes('text/html')
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const p = path.startsWith('/') ? path : `/${path}`
  let lastError: unknown

  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetch(`${base}${p}`, init)
      if (!base && looksLikeSpaHtml(res)) continue
      return res
    } catch (e) {
      lastError = e
    }
  }

  throw lastError ?? new Error('Sunucuya bağlanılamadı.')
}

export type ToolPricingRow = {
  toolKey: string
  quality: string
  creditCost: number
}

export const QUALITY_ORDER = ['1k', '2k', '4k'] as const

export function sortQualities(rows: ToolPricingRow[]): ToolPricingRow[] {
  return [...rows].sort(
    (a, b) => QUALITY_ORDER.indexOf(a.quality as (typeof QUALITY_ORDER)[number])
      - QUALITY_ORDER.indexOf(b.quality as (typeof QUALITY_ORDER)[number]),
  )
}

export function normalizeQualities(rows: unknown, toolKey = ''): ToolPricingRow[] {
  if (!Array.isArray(rows)) return []
  return sortQualities(
    rows
      .map((row) => ({
        toolKey: row?.toolKey ?? row?.ToolKey ?? toolKey,
        quality: String(row?.quality ?? row?.Quality ?? '').toLowerCase(),
        creditCost: Number(row?.creditCost ?? row?.CreditCost ?? 0),
      }))
      .filter((row) => row.quality && row.creditCost > 0),
  )
}

export function buildPricingMap(rows: unknown): Record<string, ToolPricingRow[]> {
  if (!Array.isArray(rows)) return {}

  const acc: Record<string, ToolPricingRow[]> = {}
  for (const row of rows) {
    const toolKey = row?.toolKey ?? row?.ToolKey
    const quality = String(row?.quality ?? row?.Quality ?? '').toLowerCase()
    const creditCost = row?.creditCost ?? row?.CreditCost
    if (!toolKey || !quality || creditCost == null) continue
    if (!acc[toolKey]) acc[toolKey] = []
    acc[toolKey].push({ toolKey, quality, creditCost: Number(creditCost) })
  }

  for (const key of Object.keys(acc)) {
    acc[key] = sortQualities(acc[key])
  }
  return acc
}

export function getToolQualities(map: Record<string, ToolPricingRow[]>, toolKey: string) {
  return sortQualities(map[toolKey] ?? [])
}

export async function fetchToolPricingMap(): Promise<Record<string, ToolPricingRow[]>> {
  const map: Record<string, ToolPricingRow[]> = {}

  try {
    const res = await apiFetch('/api/tools')
    if (res.ok) Object.assign(map, buildPricingMap(await res.json()))
  } catch {
    // ignore
  }

  for (const toolKey of ['pro-tryon', 'pro-decoupe', 'pro-swap']) {
    try {
      const res = await apiFetch(`/api/tools/${toolKey}/pricing`)
      if (!res.ok) continue
      const data = await res.json()
      const qualities = normalizeQualities(data?.qualities ?? data?.Qualities, toolKey)
      if (qualities.length) map[toolKey] = qualities
    } catch {
      // ignore
    }
  }

  return map
}
