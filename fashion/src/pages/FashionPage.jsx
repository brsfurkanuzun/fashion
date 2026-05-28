import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FASHION_TOOLS, getFashionTool } from '@/data/fashionTools'
import FashionToolWorkspace from '@/components/FashionToolWorkspace'

const MODE_ITEMS = [
  { id: 'cekim', label: 'FAST', subtitle: 'Hızlı Mod' },
  { id: 'produksiyon', label: 'PRO', subtitle: 'Profesyonel Mod' },
]

const TOOL_LABELS = {
  'cekim-model': 'MODEL\\TRY ON',
  'cekim-editorial': 'EDITORIAL',
  'cekim-pose': 'POSE',
  'cekim-video': 'VIDEO',
  'pro-model': 'MODEL',
  'pro-tryon': 'TRY ON',
  'pro-edit': 'EDIT',
  'pro-decoupe': 'DECOUPE',
  'pro-editorial': 'EDITORIAL',
  'pro-moodboard': 'MOODBOARD',
  'pro-swap': 'SWAP',
  'pro-pose': 'POSE',
  'pro-angle': 'ANGLE',
  'pro-video': 'VIDEO',
}

export default function FashionPage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('cekim')
  const [activeToolId, setActiveToolId] = useState(null)
  const currentTools = useMemo(
    () => FASHION_TOOLS.filter((tool) => tool.workspace === activeTab),
    [activeTab]
  )

  useEffect(() => {
    const ws = searchParams.get('ws')
    const tool = searchParams.get('tool')
    if (ws === 'produksiyon') setActiveTab('produksiyon')
    if (tool && getFashionTool(tool)) {
      const t = getFashionTool(tool)
      setActiveToolId(tool)
      if (t?.workspace === 'produksiyon') setActiveTab('produksiyon')
      else if (t?.workspace === 'cekim') setActiveTab('cekim')
    }
  }, [searchParams])

  useEffect(() => {
    if (!currentTools.length) {
      setActiveToolId(null)
      return
    }

    if (!activeToolId || !currentTools.some((tool) => tool.id === activeToolId)) {
      setActiveToolId(currentTools[0].id)
    }
  }, [activeToolId, currentTools])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setActiveToolId(null)
  }

  const activeTool = activeToolId ? getFashionTool(activeToolId) : null

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 border-b border-black/8 pb-4 dark:border-white/10 sm:grid sm:grid-cols-[220px_minmax(0,1fr)] sm:items-end sm:gap-5">
            <div className="flex w-full items-center sm:w-[220px]">
              {MODE_ITEMS.map((mode) => {
                const isActive = activeTab === mode.id
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleTabChange(mode.id)}
                    className={`relative flex min-h-[48px] flex-1 flex-col justify-center px-3 text-center transition-colors sm:px-4 ${
                      isActive
                        ? 'text-ink dark:text-white'
                        : 'text-muted hover:text-ink dark:text-white/45 dark:hover:text-white/75'
                    }`}
                  >
                    <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] sm:text-[14px]">
                      {mode.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-[9px] tracking-wide sm:text-[10px] ${
                        isActive ? 'text-subtle dark:text-white/55' : 'text-subtle/70 dark:text-white/25'
                      }`}
                    >
                      {mode.subtitle}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="studio-mode-line"
                        className="absolute inset-x-3 bottom-0 h-px bg-champagne dark:bg-[#e8dcc8]"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="min-w-0 border-t border-black/8 pt-3 dark:border-white/10 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
              <div className="scrollbar-hide -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0 lg:overflow-visible">
                <div className="flex min-h-[48px] min-w-max items-center gap-1 lg:min-w-0 lg:flex-wrap lg:gap-y-2">
                  {currentTools.map((tool) => {
                    const isActive = activeToolId === tool.id || (!activeToolId && currentTools[0]?.id === tool.id)
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveToolId(tool.id)}
                        className={`relative flex min-h-[48px] flex-shrink-0 items-center px-3 py-2 text-[10px] uppercase tracking-[0.06em] transition-colors duration-200 sm:px-4 sm:text-[11px] sm:tracking-[0.08em] ${
                          isActive
                            ? 'text-ink dark:text-white'
                            : 'text-muted hover:text-ink dark:text-white/50 dark:hover:text-white/75'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {TOOL_LABELS[tool.id] ?? tool.label.toUpperCase()}
                          {tool.isNew && (
                            <span className="inline-flex items-center rounded border border-champagne/25 bg-champagne/12 px-1 py-[1px] text-[7px] font-semibold tracking-[0.05em] text-champagne dark:border-[#e8dcc8]/25 dark:bg-[#e8dcc8]/12 dark:text-[#e8dcc8]">
                              YENI
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="studio-selection-line"
                            className="absolute inset-x-3 bottom-0 h-px bg-champagne dark:bg-[#e8dcc8]"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!activeTool && (
          <p className="text-center text-sm text-muted font-light mb-6">
            {activeTab === 'cekim'
              ? 'FAST modda hızlı çekim üretimleri için bir araç seçin.'
              : 'PRO modda gelişmiş üretim araçlarından birini seçin.'}
          </p>
        )}

        {activeTool && <FashionToolWorkspace tool={activeTool} />}
      </div>
    </div>
  )
}
