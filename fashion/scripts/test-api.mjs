#!/usr/bin/env node
/** API bağlantı testi — node scripts/test-api.mjs */

const API = process.env.API_URL || 'https://fashion-production-bc9c.up.railway.app'
const ORIGIN = process.env.ORIGIN || 'https://design.nulatechnology.com'

async function check(name, url, opts = {}) {
  try {
    const res = await fetch(url, {
      ...opts,
      headers: { Origin: ORIGIN, ...(opts.headers || {}) },
    })
    const text = await res.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = text.slice(0, 120)
    }
    const ok =
      res.ok ||
      (name.includes('bad token') && res.status === 400 && body?.message)
    console.log(`${ok ? '✓' : '✗'} ${name}: HTTP ${res.status}`, typeof body === 'object' ? JSON.stringify(body) : body)
    return ok
  } catch (e) {
    console.log(`✗ ${name}:`, e.message)
    return false
  }
}

console.log(`API: ${API}`)
console.log(`Origin: ${ORIGIN}\n`)

const results = await Promise.all([
  check('health', `${API}/api/health`),
  check('client-config', `${API}/api/auth/client-config`),
  check('firebase (bad token)', `${API}/api/auth/firebase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'bad' }),
  }),
  check('google (bad token)', `${API}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential: 'bad' }),
  }),
])

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} geçti`)
process.exit(passed === results.length ? 0 : 1)
