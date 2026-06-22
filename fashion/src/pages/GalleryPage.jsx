import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  ExternalLink,
  FolderOpen,
  FolderPlus,
  Funnel,
  Ghost,
  Heart,
  ImagePlus,
  Images,
  Info,
  Loader,
  Maximize,
  Minimize,
  MessageCircle,
  Megaphone,
  PanelRight,
  Repeat,
  RotateCcw,
  Settings,
  Shirt,
  SquareCheckBig,
  Trash2,
  Upload,
  User,
  Video,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'
import { SITE_DOWNLOAD_PREFIX } from '@/lib/brand'

const TOOL_LABELS = {
  'cekim-model': 'Manken & Giyim',
  'cekim-editorial': 'Sahne',
  'cekim-pose': 'Poz',
  'cekim-video': 'Hareket',
  'pro-model': 'Model',
  'pro-tryon': 'Try-On',
  'pro-edit': 'Edit',
  'pro-decoupe': 'Decoupe',
  'pro-editorial': 'Editorial',
  'pro-moodboard': 'Moodboard',
  'pro-swap': 'Swap',
  'pro-pose': 'Pose',
  'pro-angle': 'Angle',
  'pro-video': 'Video',
}

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(isoString) {
  const d = new Date(isoString)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function groupByDay(items) {
  const map = new Map()
  for (const item of items) {
    const key = formatDate(item.createdAtUtc)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return Array.from(map.entries()).map(([date, dayItems]) => ({ date, items: dayItems }))
}

async function downloadImage(url, filename = `${SITE_DOWNLOAD_PREFIX}-output.jpg`) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
  } catch {
    window.open(url, '_blank')
  }
}

export default function GalleryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [bannerVisible, setBannerVisible] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [likedIds, setLikedIds] = useState([])
  const [inputsOpen, setInputsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef(null)
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const tab = searchParams.get('tab') === 'collections' ? 'collections' : 'library'

  const fetchGallery = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl(`/api/gallery?userId=${user.id}`))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setGalleryItems(data)
    } catch (err) {
      setError('Galeri yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const galleryGroups = useMemo(() => groupByDay(galleryItems), [galleryItems])
  const totalItems = galleryItems.length
  const selectedItem = galleryItems.find((item) => item.id === selectedId) ?? null
  const recentItems = galleryItems.slice(0, 5)

  const closeViewer = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    setSelectedId(null)
    setZoom(1)
    setInputsOpen(false)
    setIsFullscreen(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (!selectedItem) return undefined

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !document.fullscreenElement) {
        setSelectedId(null)
        setZoom(1)
      }
      if (event.key === 'f' || event.key === 'F') toggleFullscreen()
      if (event.key === '+' || event.key === '=') setZoom((v) => Math.min(4, Number((v + 0.25).toFixed(2))))
      if (event.key === '-') setZoom((v) => Math.max(0.25, Number((v - 0.25).toFixed(2))))
      if (event.key === '0') setZoom(1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedItem, toggleFullscreen])

  const toggleLike = (id) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
  }

  const copyGenerationId = async (id) => {
    try {
      await navigator.clipboard.writeText(id)
    } catch {
      window.prompt('Generation ID', id)
    }
  }

  const toolActions = (item) => [
    { label: 'Edit', icon: WandSparkles, to: '/studio?tool=pro-edit&ws=produksiyon' },
    { label: 'Model Swap', icon: ArrowLeftRight, to: '/studio?tool=pro-swap&ws=produksiyon' },
    { label: 'Product to Model', icon: Shirt, to: '/studio?tool=pro-model&ws=produksiyon' },
    { label: 'Try-On', icon: User, to: '/studio?tool=pro-tryon&ws=produksiyon' },
    { label: 'Packshot', icon: Ghost, to: '/studio?tool=pro-decoupe&ws=produksiyon' },
    { label: 'Video', icon: Video, to: '/studio?tool=pro-video&ws=produksiyon' },
    { label: 'Assistant', icon: MessageCircle, to: '/support' },
  ]

  return (
    <main className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl bg-background backdrop-blur-md !m-0 !rounded-2xl !border-none !shadow-none">
      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block" aria-hidden="true">
        <div className="absolute left-[20%] top-[5%] h-[45%] w-[45%] rounded-full bg-[rgba(122,107,88,0.16)] opacity-[0.15] blur-[140px] dark:opacity-[0.08]" />
        <div className="absolute right-[15%] top-[15%] h-[40%] w-[35%] rounded-full bg-[rgba(212,196,176,0.22)] opacity-[0.12] blur-[120px] dark:opacity-[0.07]" />
      </div>

      {bannerVisible && (
        <div className="z-50 w-full px-3 pt-2" style={{ opacity: 1, height: 'auto', transform: 'none' }}>
          <div className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-3 py-2.5 text-[13px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] backdrop-blur-xl transition-colors duration-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:px-4 md:py-2.5 md:text-sm">
            <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Megaphone className="size-3.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="mr-1.5 font-semibold text-foreground">Introducing Packshot:</span>
              <span className="leading-snug text-foreground/80">
                {user?.name ? `${user.name}, ` : ''}turn product or on-model photos into clean catalog packshots.
              </span>
              <Link
                to="/changelog"
                className="ml-1.5 font-medium text-primary underline decoration-current/30 underline-offset-2 transition-colors duration-150 hover:text-primary/80 hover:decoration-current/60"
              >
                See what&apos;s new -&gt;
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setBannerVisible(false)}
              className="flex size-7 flex-shrink-0 items-center justify-center rounded-lg text-foreground/40 transition-all duration-150 hover:bg-foreground/5 hover:text-foreground/70"
              aria-label="Dismiss banner"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="h-full">
          <main className="flex flex-col gap-4">
            <div className="relative flex flex-col items-center">
              <div className="w-full">
                <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm">
                  <div className="flex h-12 items-center gap-3 px-4">
                    <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-muted/60 p-1 dark:bg-white/[0.06] md:p-0.5">
                      <Link
                        to="/gallery"
                        className={`relative flex items-center gap-2 rounded-md px-4 py-1.5 text-base font-medium transition-colors md:gap-1.5 md:px-3 md:py-1 md:text-sm ${
                          tab === 'library' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab === 'library' && (
                          <span className="absolute inset-0 rounded-md bg-background shadow-sm dark:bg-white/[0.1]" />
                        )}
                        <span className="relative z-[1] flex items-center gap-2 md:gap-1.5">
                          <Images className="h-4 w-4 md:h-3.5 md:w-3.5" />
                          Library
                        </span>
                      </Link>
                      <Link
                        to="/gallery?tab=collections"
                        className={`relative flex items-center gap-2 rounded-md px-4 py-1.5 text-base font-medium transition-colors md:gap-1.5 md:px-3 md:py-1 md:text-sm ${
                          tab === 'collections' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab === 'collections' && (
                          <span className="absolute inset-0 rounded-md bg-background shadow-sm dark:bg-white/[0.1]" />
                        )}
                        <span className="relative z-[1] flex items-center gap-2 md:gap-1.5">
                          <FolderOpen className="h-4 w-4 md:h-3.5 md:w-3.5" />
                          Collections
                        </span>
                      </Link>
                    </div>

                    <div className="hidden h-5 w-px shrink-0 bg-border/60 md:block" />

                    <div className="hidden min-w-0 flex-1 items-center gap-1.5 md:flex">
                      <div className="flex w-full items-center gap-1.5">
                        <button className="flex h-8 items-center gap-1.5 rounded-full border border-border/60 px-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-foreground/[0.03] hover:text-foreground md:h-7 md:text-xs">
                          <SquareCheckBig size={13} />
                          <span className="hidden md:inline">Select</span>
                        </button>
                        <button
                          type="button"
                          disabled
                          className="flex h-8 items-center gap-1.5 rounded-full border border-border/60 px-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-foreground/[0.03] hover:text-foreground disabled:pointer-events-none disabled:opacity-30 md:h-7 md:text-xs"
                        >
                          <Upload size={13} />
                          <span className="hidden md:inline">Import</span>
                        </button>
                        <button className="ml-auto flex h-8 items-center gap-1.5 rounded-full border border-border/60 px-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-foreground/[0.03] hover:text-foreground md:h-7 md:text-xs">
                          <Funnel size={13} />
                          <span className="hidden md:inline">Filters</span>
                        </button>
                      </div>
                    </div>

                    <div className="hidden h-5 w-px shrink-0 bg-border/60 md:block" />

                    <div className="ml-auto hidden shrink-0 md:block">
                      <nav aria-label="pagination" className="flex items-center gap-1">
                        <button
                          disabled
                          aria-label="Previous page"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5 px-1 text-sm tabular-nums">
                          <span className="hidden text-xs font-medium text-muted-foreground md:inline">Page</span>
                          <input
                            readOnly
                            type="text"
                            value="1"
                            className="h-7 w-7 rounded-lg border border-border/60 bg-background/80 text-center text-sm font-medium tabular-nums"
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            <span className="hidden md:inline">of </span>
                            <span className="md:hidden">/ </span>1
                          </span>
                        </div>
                        <button
                          disabled
                          aria-label="Next page"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>

                  <div className="flex h-10 items-center border-t border-border/20 px-4 md:hidden">
                    <div className="ml-auto shrink-0">
                      <nav aria-label="pagination" className="flex items-center gap-1">
                        <button
                          disabled
                          aria-label="Previous page"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5 px-1 text-sm tabular-nums">
                          <input
                            readOnly
                            type="text"
                            value="1"
                            className="h-7 w-7 rounded-lg border border-border/60 bg-background/80 text-center text-sm font-medium tabular-nums"
                          />
                          <span className="text-xs font-medium text-muted-foreground">/ 1</span>
                        </div>
                        <button
                          disabled
                          aria-label="Next page"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>

                <div style={{ opacity: 1, transform: 'none' }}>
                  <div className="w-full">
                    <div className="relative flex flex-col">
                      {tab === 'library' ? (
                        <div className="px-6 pt-5 pb-4">
                          {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                              <Loader className="mb-3 h-7 w-7 animate-spin text-champagne" />
                              <p className="text-sm">Galeri yükleniyor...</p>
                            </div>
                          ) : error ? (
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                              <p className="text-sm">{error}</p>
                              <button type="button" onClick={fetchGallery} className="mt-3 text-xs underline">
                                Tekrar dene
                              </button>
                            </div>
                          ) : galleryGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                              <ImagePlus className="mb-3 h-10 w-10 opacity-30" strokeWidth={1.4} />
                              <p className="text-sm font-medium">Henüz üretim yok</p>
                              <p className="mt-1 text-xs text-muted-foreground">Studio'da ilk görselini oluştur.</p>
                              <Link
                                to="/studio"
                                className="mt-4 rounded-xl border border-border/60 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
                              >
                                Studio'ya git
                              </Link>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-8">
                              {galleryGroups.map((group) => (
                                <section key={group.date} className="flex flex-col gap-4">
                                  <div className="flex w-full items-center gap-3">
                                    <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {group.date}
                                    </span>
                                    <div className="h-px flex-1 bg-border" />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 xl:max-w-6xl xl:grid-cols-5 2xl:max-w-full 2xl:grid-cols-6">
                                    {group.items.map((item) => (
                                      <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSelectedId(item.id)}
                                        className="group relative h-full w-full cursor-pointer overflow-hidden rounded-lg bg-muted text-left transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)]:hover:scale-[1.02] [@media(hover:hover)]:hover:shadow-lg"
                                      >
                                        <img
                                          alt={`Generated from ${TOOL_LABELS[item.toolKey] ?? item.toolKey}`}
                                          className="block aspect-[3/4] h-auto w-full rounded-lg object-cover transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-105"
                                          src={item.previewUrl}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white opacity-0 transition-opacity group-hover:opacity-100">
                                          <p className="text-xs font-medium">{TOOL_LABELS[item.toolKey] ?? item.toolKey}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </section>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="px-6 pt-8 pb-10">
                          <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card/70 p-10 text-center backdrop-blur-xl">
                            <FolderOpen className="mx-auto h-10 w-10 text-champagne-dim" strokeWidth={1.5} />
                            <h2 className="mt-4 text-2xl font-semibold text-foreground">Collections</h2>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                              Koleksiyon görünümü de hazırlanıyor. Backend bağlandığında galerideki üretimleri proje veya
                              kampanya bazında burada gruplayacağız.
                            </p>
                          </div>
                        </div>
                      )}

                      <input
                        accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.heic,.heif"
                        multiple
                        tabIndex={-1}
                        type="file"
                        style={{
                          border: 0,
                          clip: 'rect(0px, 0px, 0px, 0px)',
                          clipPath: 'inset(50%)',
                          height: '1px',
                          margin: '0px -1px -1px 0px',
                          overflow: 'hidden',
                          padding: 0,
                          position: 'absolute',
                          width: '1px',
                          whiteSpace: 'nowrap',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="h-16 pb-[env(safe-area-inset-bottom)] md:hidden" />

      {selectedItem && createPortal(
        <div
          ref={viewerRef}
          className="fixed inset-0 z-[9999] flex flex-col bg-black"
        >
          {/* toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-black/80 px-4 py-2.5 backdrop-blur-sm">
            {/* left — zoom controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={zoom <= 0.25}
                onClick={() => setZoom((v) => Math.max(0.25, Number((v - 0.25).toFixed(2))))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="min-w-[3.5rem] rounded-lg px-2 py-1 text-center text-xs font-medium tabular-nums text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((v) => Math.min(4, Number((v + 0.25).toFixed(2))))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="mx-2 h-4 w-px bg-white/10" />
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* center — tool label */}
            <span className="hidden text-xs font-medium tracking-[0.08em] text-white/40 uppercase sm:inline">
              {TOOL_LABELS[selectedItem.toolKey] ?? selectedItem.toolKey}
            </span>

            {/* right — actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => downloadImage(selectedItem.previewUrl, `${SITE_DOWNLOAD_PREFIX}-${selectedItem.toolKey}.jpg`)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleLike(selectedItem.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Like"
              >
                <Heart className={`h-4 w-4 ${likedIds.includes(selectedItem.id) ? 'fill-white text-white' : ''}`} />
              </button>
              <a
                href={selectedItem.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <div className="mx-2 h-4 w-px bg-white/10 hidden sm:block" />
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className={`hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10 ${sidebarOpen ? 'text-white' : 'text-white/40 hover:text-white'}`}
                aria-label="Toggle info panel"
              >
                <PanelRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
              <div className="mx-2 h-4 w-px bg-white/10" />
              <button
                type="button"
                onClick={closeViewer}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* body */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* image area */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
              <img
                alt="Generated content"
                draggable="false"
                src={selectedItem.previewUrl}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-150"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              />
            </div>

            {/* info sidebar */}
            <div className={`${sidebarOpen ? 'flex' : 'hidden'} w-full sm:w-80 shrink-0 flex-col overflow-y-auto border-t border-white/[0.06] bg-[#111] sm:border-l sm:border-t-0`}>
              <div className="flex h-full flex-col text-white">
                <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{TOOL_LABELS[selectedItem.toolKey] ?? selectedItem.toolKey}</p>
                      <p className="mt-0.5 text-[11px] text-white/40">{formatTime(selectedItem.createdAtUtc)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => downloadImage(selectedItem.previewUrl, `${SITE_DOWNLOAD_PREFIX}-${selectedItem.toolKey}.jpg`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="İndir"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/studio?tool=${selectedItem.toolKey}`)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Repeat className="h-3 w-3" />
                        Tekrar üret
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-white/30">Şunlarda kullan</p>
                    <div className="flex flex-wrap gap-1.5">
                      {toolActions(selectedItem).map((action) => {
                        const Icon = action.icon
                        return (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => { closeViewer(); navigate(action.to) }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                          >
                            <Icon className="h-3 w-3" />
                            {action.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  <div>
                    <button
                      type="button"
                      onClick={() => setInputsOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      Generation ID
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${inputsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {inputsOpen && (
                      <div className="mt-2 rounded-lg bg-white/[0.03] px-3 py-3">
                        <p className="break-all font-mono text-[11px] text-white/40 select-all">
                          {selectedItem.sourceJobId ?? selectedItem.id}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyGenerationId(selectedItem.sourceJobId ?? selectedItem.id)}
                          className="mt-2 text-[10px] text-white/30 transition-colors hover:text-white/60"
                        >
                          Kopyala
                        </button>
                      </div>
                    )}
                  </div>

                  {recentItems.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-white/30">Son Üretimler</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {recentItems.map((item) => (
                          <button
                            key={`recent-${item.id}`}
                            type="button"
                            onClick={() => { setSelectedId(item.id); setZoom(1) }}
                            className={`group relative aspect-[3/4] overflow-hidden rounded-lg transition-all ${item.id === selectedId ? 'ring-2 ring-white/60' : 'opacity-60 hover:opacity-100'}`}
                          >
                            <img
                              alt={TOOL_LABELS[item.toolKey] ?? item.toolKey}
                              src={item.previewUrl}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  )
}
