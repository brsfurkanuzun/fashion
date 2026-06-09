import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Dikey ayırıcılı yatay karşılaştırma: sol = before, sağ = after.
 * clip-path yerine overflow + sabit genişlikte üst görsel (tarayıcı uyumu).
 */
export default function HeroImageCompare({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = 'Editöryal kalite',
  afterLabel = 'Decoupe',
  beforeObjectPosition = '50% 18%',
  afterObjectPosition = '50% 35%',
}) {
  const rootRef = useRef(null)
  const dragging = useRef(false)
  const [pct, setPct] = useState(50)
  const [containerWidth, setContainerWidth] = useState(0)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => {
      const w = el.getBoundingClientRect().width
      if (w > 0) setContainerWidth(Math.round(w))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const setFromClientX = useCallback((clientX) => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width <= 0) return
    const x = clientX - r.left
    const p = (x / r.width) * 100
    if (!Number.isFinite(p)) return
    setPct(Math.min(100, Math.max(0, p)))
  }, [])

  const onPointerDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    setFromClientX(e.clientX)
  }

  const onPointerUp = (e) => {
    dragging.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const safePct = Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 50
  const beforeStretchPct = (100 * 100) / Math.max(safePct, 0.01)
  const beforeImgStyle =
    containerWidth > 0
      ? { width: `${containerWidth}px`, minWidth: `${containerWidth}px`, objectPosition: beforeObjectPosition }
      : { width: `${beforeStretchPct}%`, minWidth: `${beforeStretchPct}%`, objectPosition: beforeObjectPosition }

  return (
    <div
      ref={rootRef}
      role="slider"
      aria-valuenow={Math.round(safePct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Görsel karşılaştırma"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPct((p) => Math.max(0, (Number.isFinite(p) ? p : 50) - 3))
        if (e.key === 'ArrowRight') setPct((p) => Math.min(100, (Number.isFinite(p) ? p : 50) + 3))
        if (e.key === 'Home') setPct(0)
        if (e.key === 'End') setPct(100)
      }}
      className="relative min-h-0 min-w-0 w-full max-w-[min(100%,400px)] sm:max-w-[min(100%,440px)] lg:max-w-[min(100%,400px)] lg:w-full aspect-[9/16] overflow-hidden rounded-2xl border border-subtle shadow-xl shadow-black/40 ring-1 ring-white/10 touch-none select-none cursor-ew-resize outline-none focus-visible:ring-2 focus-visible:ring-champagne"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={afterSrc}
        alt={afterAlt}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        style={{ objectPosition: afterObjectPosition }}
        loading="lazy"
        draggable={false}
      />

      <div
        className="pointer-events-none absolute inset-y-0 left-0 top-0 z-[1] overflow-hidden"
        style={{ width: `${safePct}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="h-full max-w-none object-cover"
          style={beforeImgStyle}
          fetchPriority="high"
          draggable={false}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div
        className="pointer-events-none absolute top-0 bottom-0 z-[3] w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
        style={{ left: `${safePct}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-9 min-w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-px rounded-full border border-white/30 bg-ink/85 px-1.5 text-white shadow-lg backdrop-blur-sm">
          <ChevronLeft size={15} strokeWidth={2.5} className="opacity-95 shrink-0" aria-hidden />
          <ChevronRight size={15} strokeWidth={2.5} className="opacity-95 shrink-0" aria-hidden />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-[4] flex justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3">
        <p className="max-w-[42%] text-[0.65rem] leading-tight text-white/90 font-medium drop-shadow-md">{beforeLabel}</p>
        <p className="max-w-[42%] text-right text-[0.65rem] leading-tight text-white/90 font-medium drop-shadow-md">
          {afterLabel}
        </p>
      </div>
    </div>
  )
}
