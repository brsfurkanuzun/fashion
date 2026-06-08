import { useState, useEffect } from 'react'

import { ArrowRight, CreditCard } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'

const WORKSPACE_LABELS = {

  cekim: 'Çekim',

  produksiyon: 'Prodüksiyon',

}



function QualityMatrix({ qualities }) {

  if (!qualities?.length) return null

  return (

    <div className="mt-2">

      <div className="overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.07]">

        <div className="grid grid-cols-2 border-b border-black/[0.06] bg-black/[0.02] px-3 py-1.5 text-[9px] uppercase tracking-[0.07em] text-muted dark:border-white/[0.06] dark:bg-white/[0.03]">

          <span>Kalite</span><span className="text-right">Kredi</span>

        </div>

        {qualities.map((q, i) => (

          <div key={q.quality} className={`grid grid-cols-2 items-center px-3 py-2 ${i < qualities.length - 1 ? 'border-b border-black/[0.04] dark:border-white/[0.04]' : ''}`}>

            <span className="text-[11px] text-muted">{q.quality.toUpperCase()}</span>

            <span className="text-right text-[12px] font-semibold text-ink dark:text-white">{q.creditCost} kr</span>

          </div>

        ))}

      </div>

      <p className="mt-1.5 text-[10px] text-muted">× görsel sayısı (try-on) · pgAdmin'den değiştirilebilir</p>

    </div>

  )

}



export default function BillingPage() {

  const navigate = useNavigate()

  const { credits, user } = useAuth()

  const currentPlan = user?.role === 'admin' ? 'pro' : 'free'



  const [tools, setTools] = useState([])



  useEffect(() => {
    fetch(apiUrl('/api/tools'))
      .then(r => r.ok ? r.json() : [])
      .then((rows) => {
        const byKey = {}
        for (const row of Array.isArray(rows) ? rows : []) {
          const toolKey = row.toolKey ?? row.ToolKey
          const quality = row.quality ?? row.Quality
          const creditCost = row.creditCost ?? row.CreditCost
          if (!toolKey || !quality || creditCost == null) continue
          if (!byKey[toolKey]) {
            byKey[toolKey] = {
              toolKey,
              label: row.label ?? row.Label ?? toolKey,
              workspace: row.workspace ?? row.Workspace,
              isNew: row.isNew ?? row.IsNew ?? false,
              qualities: [],
            }
          }
          byKey[toolKey].qualities.push({ quality, creditCost: Number(creditCost) })
        }
        setTools(Object.values(byKey))
      })
      .catch(() => {})
  }, [])

  const grouped = tools.reduce((acc, tool) => {
    const ws = tool.workspace ?? 'diger'
    if (!acc[ws]) acc[ws] = []
    acc[ws].push(tool)
    return acc
  }, {})



  return (

    <div className="min-h-screen pt-20">

      <div className="flex min-h-0 flex-1 flex-col overflow-auto">

        <div className="h-full">

          <div className="flex flex-col gap-2 p-4 md:p-8">

            <h1 className="text-2xl font-bold text-ink">Faturalama</h1>

            <p className="text-muted">Plan, kredi bakiyesi ve özellik maliyetleri</p>

          </div>



          <div className="flex w-full flex-col gap-6 px-4 pb-10 md:px-8">



            {/* Plan + Credits */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

              <div className="rounded-3xl border border-black/[0.08] bg-white/80 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]">

                <h3 className="mb-5 text-xl font-semibold text-ink dark:text-zinc-100">Plan</h3>

                <div className="mb-6 flex items-center justify-between py-2">

                  <span className="text-sm text-muted">Aktif Plan</span>

                  <span className="text-sm font-medium uppercase tracking-[0.2em] text-ink dark:text-zinc-100">{currentPlan}</span>

                </div>

                <div className="border-t border-black/[0.08] pt-4 dark:border-white/[0.08]">

                  <button type="button" onClick={() => navigate('/fiyatlandirma')}

                    className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-foreground/20 px-4 text-sm font-medium text-foreground transition hover:bg-foreground/[0.04] dark:border-white/[0.12] dark:hover:bg-white/[0.06]">

                    <CreditCard className="mr-2 h-4 w-4" /> Planı Yönet

                  </button>

                </div>

              </div>



              <div className="rounded-3xl border border-black/[0.08] bg-white/80 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]">

                <h3 className="mb-5 text-xl font-semibold text-ink dark:text-zinc-100">Kredi</h3>

                <div className="mb-6 flex items-center justify-between py-2">

                  <span className="text-sm text-muted">Mevcut Bakiye</span>

                  <span className="text-sm font-semibold text-ink dark:text-zinc-100">{credits} kredi</span>

                </div>

                <div className="border-t border-black/[0.08] pt-4 dark:border-white/[0.08]">

                  <button type="button" onClick={() => navigate('/fiyatlandirma')}

                    className="group inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] px-4 text-sm font-medium text-[var(--btn-primary-text)] transition hover:brightness-110">

                    Kredi Yükle <ArrowRight className="ml-2 h-4 w-4 transition-all group-hover:translate-x-1" />

                  </button>

                </div>

              </div>

            </div>



            {/* Özellik Kredi Bedelleri */}

            <div className="rounded-3xl border border-black/[0.08] bg-white/80 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]">

              <h3 className="mb-5 text-xl font-semibold text-ink dark:text-zinc-100">Özellik Kredi Bedelleri</h3>



              {tools.length === 0 ? (

                <p className="text-sm text-muted">Yükleniyor...</p>

              ) : (

                <div className="space-y-6">

                  {Object.entries(grouped).map(([ws, items]) => (

                    <div key={ws}>

                      <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-muted">

                        {WORKSPACE_LABELS[ws] ?? ws}

                      </p>

                      <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.07]">

                        {items.map((tool, i) => {

                          const qualities = tool.qualities ?? []

                          const costs = qualities.map(q => q.creditCost)

                          const minCost = costs.length ? Math.min(...costs) : 0

                          const maxCost = costs.length ? Math.max(...costs) : 0

                          const hasMultiple = qualities.length > 1

                          return (

                            <div key={tool.toolKey}

                              className={`px-4 py-3 ${i < items.length - 1 ? 'border-b border-black/[0.04] dark:border-white/[0.04]' : ''}`}>

                              <div className="flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                  <span className="text-[12px] font-medium text-ink dark:text-white">{tool.label}</span>

                                  {tool.isNew && (

                                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-widest text-muted dark:bg-white/[0.08]">yeni</span>

                                  )}

                                </div>

                                {hasMultiple ? (

                                  <span className="text-[11px] text-muted">

                                    {minCost}–{maxCost} kr · 1k/2k/4k

                                  </span>

                                ) : (

                                  <span className="text-[13px] font-semibold tabular-nums text-ink dark:text-white">

                                    {minCost} <span className="text-[11px] font-normal text-muted">kredi</span>

                                  </span>

                                )}

                              </div>

                              {hasMultiple && <QualityMatrix qualities={qualities} />}

                            </div>

                          )

                        })}

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>



          </div>

        </div>

      </div>

    </div>

  )

}

