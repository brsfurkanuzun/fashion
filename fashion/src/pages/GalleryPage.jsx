import { useEffect, useMemo, useState } from 'react'
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
  MessageCircle,
  Megaphone,
  MoreVertical,
  Plus,
  Repeat,
  RotateCcw,
  Send,
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

const GALLERY_GROUPS = [
  {
    date: 'May 26, 2026',
    items: [
      {
        id: 'g-1',
        tool: 'Product to Model',
        description: 'Turn wearable product images into professional model photography',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc6ae-7f6a-76a3-841f-3c15250ef47e',
        createdAt: '26 Apr 26, 1:06 am',
        dimensions: '2048x2048',
        prompt: 'Create a luxury editorial look with soft studio lighting, elevated styling, and clean fashion composition.',
      },
      {
        id: 'g-2',
        tool: 'Edit',
        description: 'Change color, pose, background and more with a single prompt',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc6ad-b0a8-7fa0-b91f-b818476c416f',
        createdAt: '26 Apr 26, 12:54 am',
        dimensions: '2048x2048',
        prompt: 'Refine the composition, clean the background, and enhance the styling with a premium campaign finish.',
      },
      {
        id: 'g-3',
        tool: 'Edit',
        description: 'Refine details and color treatment for campaign-ready output',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc6ad-43a4-72b3-9a32-bc7df1e2c6f5',
        createdAt: '26 Apr 26, 12:31 am',
        dimensions: '1600x2000',
        prompt: 'Adjust the tonal balance, sharpen clothing detail, and give the image a premium magazine feel.',
      },
      {
        id: 'g-4',
        tool: 'Product to Model',
        description: 'Create premium lookbook imagery from a single product image',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc6ac-9ca7-7160-a1f7-34386439f7e5',
        createdAt: '25 Apr 26, 11:48 pm',
        dimensions: '2048x2048',
        prompt: 'Generate a polished model shot with soft shadows and neutral editorial styling.',
      },
      {
        id: 'g-5',
        tool: 'Try-On',
        description: 'Visualize how an outfit looks on different models',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc6ab-9a15-7523-ae3a-8539c218d35e',
        createdAt: '25 Apr 26, 11:20 pm',
        dimensions: '1536x2048',
        prompt: 'Apply the selected garment to a confident fashion model while preserving fit and material texture.',
      },
      {
        id: 'g-6',
        tool: 'Try-On',
        description: 'Try a garment across different styles and silhouettes',
        image: 'https://images.unsplash.com/photo-1506629905607-d9f786ae6a2f?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc6a9-fbc0-73e1-a90e-febf378c7849',
        createdAt: '25 Apr 26, 10:52 pm',
        dimensions: '1536x2048',
        prompt: 'Place the clothing on a new model with a fashion-forward silhouette and clean studio framing.',
      },
    ],
  },
  {
    date: 'May 24, 2026',
    items: [
      {
        id: 'g-7',
        tool: 'Editorial',
        description: 'Build a stronger fashion story with dramatic scene direction',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc699-e8a1-7123-a90d-2cb1f3781234',
        createdAt: '24 Apr 26, 6:10 pm',
        dimensions: '1600x2000',
        prompt: 'Create a cinematic editorial frame with directional light and refined neutral tones.',
      },
      {
        id: 'g-8',
        tool: 'Pose',
        description: 'Explore dynamic movement and posing variations',
        image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc698-a1d2-7432-b710-6ac2d9184abc',
        createdAt: '24 Apr 26, 5:42 pm',
        dimensions: '1536x2048',
        prompt: 'Shift the model into a stronger editorial pose while maintaining styling coherence.',
      },
      {
        id: 'g-9',
        tool: 'Model',
        description: 'Generate a new virtual model direction for the same collection',
        image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc697-5ff2-7332-9c41-a8aef12db882',
        createdAt: '24 Apr 26, 4:58 pm',
        dimensions: '1536x2048',
        prompt: 'Create a fresh AI model for this campaign with premium casting and minimal styling.',
      },
      {
        id: 'g-10',
        tool: 'Scene',
        description: 'Rebuild the environment around the fashion subject',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        generationId: 'gen-019dc696-44aa-71aa-8ed0-1a32bc7df100',
        createdAt: '24 Apr 26, 3:40 pm',
        dimensions: '1792x1344',
        prompt: 'Place the fashion subject in a premium scene with modern set design and brand-consistent tone.',
      },
    ],
  },
]

export default function GalleryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [bannerVisible, setBannerVisible] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [likedIds, setLikedIds] = useState([])
  const [inputsOpen, setInputsOpen] = useState(false)
  const tab = searchParams.get('tab') === 'collections' ? 'collections' : 'library'
  const totalItems = useMemo(
    () => GALLERY_GROUPS.reduce((acc, group) => acc + group.items.length, 0),
    []
  )
  const allItems = useMemo(() => GALLERY_GROUPS.flatMap((group) => group.items), [])
  const selectedItem = allItems.find((item) => item.id === selectedId) ?? null
  const recentItems = allItems.slice(0, 5)

  useEffect(() => {
    if (!selectedItem) return undefined

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedId(null)
        setZoom(1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedItem])

  const closeViewer = () => {
    setSelectedId(null)
    setZoom(1)
    setInputsOpen(false)
  }

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
    { label: 'Edit', icon: WandSparkles, to: '/fashion?tool=pro-edit&ws=produksiyon' },
    { label: 'Model Swap', icon: ArrowLeftRight, to: '/fashion?tool=pro-swap&ws=produksiyon' },
    { label: 'Product to Model', icon: Shirt, to: '/fashion?tool=pro-model&ws=produksiyon' },
    { label: 'Try-On', icon: User, to: '/fashion?tool=pro-tryon&ws=produksiyon' },
    { label: 'Packshot', icon: Ghost, to: '/fashion?tool=pro-decoupe&ws=produksiyon' },
    { label: 'Video', icon: Video, to: '/fashion?tool=pro-video&ws=produksiyon' },
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
                          <div className="flex flex-col gap-8">
                            {GALLERY_GROUPS.map((group) => (
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
                                        alt={`Generated from ${item.tool}`}
                                        className="block aspect-[3/4] h-auto w-full rounded-lg object-cover transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-105"
                                        src={item.image}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                      <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        <p className="text-xs font-medium">{item.tool}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </section>
                            ))}
                          </div>
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

      {selectedItem && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={closeViewer} />

          <div className="fixed inset-x-0 top-0 bottom-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-background md:top-14 md:h-auto md:flex-row md:rounded-xl md:bg-background/92">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    type="button"
                    disabled={zoom <= 0.6}
                    onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(1))))}
                    className="inline-flex h-fit w-fit items-center justify-center rounded-xl p-1 text-foreground transition-all hover:bg-white/60 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-white/5"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="min-w-[3rem] text-center text-xs font-medium md:min-w-[4rem] md:text-sm">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((value) => Math.min(3, Number((value + 0.1).toFixed(1))))}
                    className="inline-flex h-fit w-fit items-center justify-center rounded-xl p-1 text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="inline-flex h-fit w-fit items-center justify-center rounded-xl p-1 text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={closeViewer}
                  className="inline-flex h-fit w-fit items-center justify-center rounded-xl p-1 text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/20 p-4 md:p-8">
                <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center">
                  <img
                    alt="Generated content"
                    draggable="false"
                    src={selectedItem.image}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>

                <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/80 backdrop-blur-sm md:bottom-6 md:left-6">
                  {selectedItem.dimensions}
                </span>
              </div>

              <div className="shrink-0 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
                <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center font-medium">
                  <a
                    href={selectedItem.image}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-fit w-fit flex-col items-center justify-center rounded-xl p-1 px-5 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                  >
                    <Download className="mb-1 h-5 w-5" />
                    <span className="text-xs">Save</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleLike(selectedItem.id)}
                    className="inline-flex h-fit w-fit flex-col items-center justify-center rounded-xl p-1 px-5 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                  >
                    <Heart className={`mb-1 h-5 w-5 ${likedIds.includes(selectedItem.id) ? 'fill-current' : ''}`} />
                    <span className="text-xs">Like</span>
                  </button>
                  <a
                    href={selectedItem.image}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-fit w-fit flex-col items-center justify-center rounded-xl p-1 px-5 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                  >
                    <ExternalLink className="mb-1 h-5 w-5" />
                    <span className="text-xs">Open</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setInputsOpen((value) => !value)}
                    className="inline-flex h-fit w-fit flex-col items-center justify-center rounded-xl p-1 px-5 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                  >
                    <Info className="mb-1 h-5 w-5" />
                    <span className="text-xs">Info</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-fit w-fit flex-col items-center justify-center rounded-xl p-1 px-5 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                  >
                    <MoreVertical className="mb-1 h-5 w-5" />
                    <span className="text-xs">Actions</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-card md:block">
              <div className="flex h-full flex-col">
                <div className="flex flex-col gap-6 border-b border-border p-6">
                  <div className="flex items-center justify-between">
                    <p className="mt-1 text-xs">{selectedItem.createdAt}</p>
                    <div className="flex gap-2">
                      <a
                        href={selectedItem.image}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-fit w-fit items-center whitespace-nowrap rounded-xl bg-transparent p-1 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                        aria-label="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <a
                        href={selectedItem.image}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-fit w-fit items-center whitespace-nowrap rounded-xl bg-transparent p-1 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                        aria-label="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleLike(selectedItem.id)}
                        className="inline-flex h-fit w-fit items-center whitespace-nowrap rounded-xl p-1 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                        aria-label="Like"
                      >
                        <Heart className={`h-4 w-4 ${likedIds.includes(selectedItem.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-fit w-fit items-center whitespace-nowrap rounded-xl bg-transparent p-1 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                        aria-label="Add to Collection"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-fit w-fit items-center whitespace-nowrap rounded-xl bg-transparent p-1 text-sm font-medium text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/5"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Created in</p>
                    <p className="text-sm font-medium">{selectedItem.tool}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="mb-3 text-sm font-semibold">Use in</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {toolActions(selectedItem).map((action) => {
                          const Icon = action.icon
                          return (
                            <button
                              key={action.label}
                              type="button"
                              onClick={() => navigate(action.to)}
                              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl border border-foreground/20 px-3 text-xs font-medium text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-foreground/35 hover:bg-foreground/[0.04] dark:border-white/[0.12] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                            >
                              <Icon className="mr-2 h-4 w-4" />
                              {action.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="border-b border-border" />

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => navigate('/fashion')}
                        className="inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-xl border border-foreground/20 px-3 text-sm font-medium text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-foreground/35 hover:bg-foreground/[0.04] dark:border-white/[0.12] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                      >
                        <Repeat className="mr-2 h-4 w-4" />
                        Reuse Inputs
                      </button>

                      <div className="overflow-hidden rounded-lg">
                        <button
                          type="button"
                          onClick={() => setInputsOpen((value) => !value)}
                          className="flex w-full items-center justify-between rounded-lg bg-muted p-4 text-sm font-semibold"
                        >
                          Inputs
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${inputsOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {inputsOpen && (
                          <div className="space-y-3 px-4 py-4 text-sm text-muted-foreground">
                            <p className="leading-relaxed">{selectedItem.prompt}</p>
                            <div className="rounded-xl border border-border bg-background/80 p-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-subtle">Generation ID</p>
                              <p className="mt-2 break-all font-mono text-xs text-ink dark:text-zinc-200">
                                {selectedItem.generationId}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyGenerationId(selectedItem.generationId)}
                      className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Settings className="h-3 w-3" />
                      Copy Generation ID
                    </button>

                    <section className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Recent Generations</h2>
                        <Link to="/gallery">
                          <Images className="h-5 w-5" />
                        </Link>
                      </div>
                      <p className="text-sm text-muted-foreground">The most recent results generated through the app.</p>
                      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
                        {recentItems.map((item) => (
                          <button
                            key={`recent-${item.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedId(item.id)
                              setZoom(1)
                            }}
                            className="group relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-lg"
                          >
                            <img
                              alt={`Generated from ${item.tool}`}
                              className="block aspect-[3/4] h-auto w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                              src={item.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white opacity-0 transition-opacity group-hover:opacity-100">
                              <p className="text-xs font-medium">{item.tool}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
