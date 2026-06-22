import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { STUDIO_TOOLS, getStudioTool } from '@/data/studioTools'
import StudioToolWorkspace from '@/components/StudioToolWorkspace'

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

export default function StudioPage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('cekim')
  const [activeToolId, setActiveToolId] = useState(null)
  const currentTools = useMemo(
    () => STUDIO_TOOLS.filter((tool) => tool.workspace === activeTab),
    [activeTab]
  )

  useEffect(() => {
    const ws = searchParams.get('ws')
    const tool = searchParams.get('tool')
    if (ws === 'produksiyon') setActiveTab('produksiyon')
    if (tool && getStudioTool(tool)) {
      const t = getStudioTool(tool)
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

  const handleToolSelect = (toolId, workspace) => {
    setActiveTab(workspace)
    setActiveToolId(toolId)
  }

  const activeTool = activeToolId ? getStudioTool(activeToolId) : null

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="mx-auto flex max-w-[1400px] flex-col px-5 sm:px-8 lg:flex-row lg:gap-0">
        <aside className="mb-6 w-full shrink-0 border-b border-black/8 pb-6 dark:border-white/10 lg:mb-0 lg:w-[240px] lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <nav className="flex flex-col gap-6">
            {MODE_ITEMS.map((mode) => {
              const modeTools = STUDIO_TOOLS.filter((tool) => tool.workspace === mode.id)
              const isModeActive = activeTab === mode.id

              return (
                <div key={mode.id}>
                  <button
                    type="button"
                    onClick={() => handleTabChange(mode.id)}
                    className={`relative w-full rounded-md px-3 py-2 text-left transition-colors ${
                      isModeActive
                        ? 'text-ink dark:text-white'
                        : 'text-muted hover:text-ink dark:text-white/45 dark:hover:text-white/80'
                    }`}
                  >
                    <span className="block text-[13px] font-semibold uppercase tracking-[0.1em]">
                      {mode.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-[10px] tracking-wide ${
                        isModeActive ? 'text-subtle dark:text-white/50' : 'text-subtle/70 dark:text-white/25'
                      }`}
                    >
                      {mode.subtitle}
                    </span>
                    {isModeActive && (
                      <motion.div
                        layoutId="studio-mode-line"
                        className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-champagne dark:bg-[#e8dcc8]"
                      />
                    )}
                  </button>

                  <div className="mt-1.5 flex flex-col gap-0.5 border-l border-black/8 pl-3 dark:border-white/10">
                    {modeTools.map((tool) => {
                      const isToolActive =
                        activeToolId === tool.id
                        || (isModeActive && !activeToolId && modeTools[0]?.id === tool.id)

                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => handleToolSelect(tool.id, mode.id)}
                          className={`relative rounded-md px-2 py-1.5 text-left text-[11px] uppercase tracking-[0.08em] transition-colors ${
                            isToolActive
                              ? 'text-ink dark:text-white'
                              : 'text-muted hover:text-ink dark:text-white/50 dark:hover:text-white/80'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {TOOL_LABELS[tool.id] ?? tool.label.toUpperCase()}
                            {tool.isNew && (
                              <span className="inline-flex items-center rounded border border-champagne/25 bg-champagne/12 px-1 py-[1px] text-[7px] font-semibold tracking-[0.05em] text-champagne dark:border-[#e8dcc8]/25 dark:bg-[#e8dcc8]/12 dark:text-[#e8dcc8]">
                                YENI
                              </span>
                            )}
                          </span>
                          {isToolActive && (
                            <motion.div
                              layoutId="studio-selection-line"
                              className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-champagne dark:bg-[#e8dcc8]"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 lg:pl-10">
          {!activeTool && (
            <p className="mb-6 text-sm font-light text-muted">
              {activeTab === 'cekim'
                ? 'FAST modda hızlı çekim üretimleri için bir araç seçin.'
                : 'PRO modda gelişmiş üretim araçlarından birini seçin.'}
            </p>
          )}

          {activeTool && <StudioToolWorkspace tool={activeTool} />}
        </div>
      </div>
    </div>
  )
}
