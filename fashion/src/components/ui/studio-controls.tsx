import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Loader } from 'lucide-react'
import { RippleButton } from '@/components/ui/multi-type-ripple-buttons'

export const STUDIO_GLASS_PANEL =
  'overflow-hidden rounded-[1.5rem] border border-black/10 bg-gradient-to-br from-black/[0.04] via-transparent to-black/[0.02] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] backdrop-blur-[14px] dark:border-white/10 dark:from-white/10 dark:via-white/[0.03] dark:to-transparent dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)] dark:backdrop-brightness-[0.91]'

export const STUDIO_GLASS_CARD =
  'rounded-[1.25rem] border border-black/[0.06] bg-gradient-to-br from-[var(--card-bg)]/95 via-[var(--card-bg)]/70 to-transparent p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md transition-colors duration-200 dark:border-white/[0.08] dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'

export const STUDIO_UPLOAD_SHELL =
  'group/upload rounded-[1.25rem] border border-black/[0.06] bg-gradient-to-br from-[var(--card-bg)]/90 to-transparent p-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-champagne/25 hover:shadow-md dark:border-white/[0.08] dark:from-white/[0.04] dark:hover:border-[#e8dcc8]/25'

export function StudioGlassDivider() {
  return (
    <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(122,107,88,0.22)_50%,transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(232,220,200,0.18)_50%,transparent)]" />
  )
}

export type StudioSegmentOption = {
  value: string
  label: string
  sub?: string
  badge?: string | number | null
}

type StudioSegmentGridProps = {
  options: StudioSegmentOption[]
  value: string
  onChange: (value: string) => void
  columns?: 2 | 3 | 4
  groupId?: string
  className?: string
}

export function StudioSegmentGrid({
  options,
  value,
  onChange,
  columns = 3,
  groupId = 'studio-segment',
  className = '',
}: StudioSegmentGridProps) {
  const colClass = columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <div className={`grid gap-1.5 ${colClass} ${className}`.trim()}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex flex-col items-center overflow-hidden rounded-xl border px-2 py-2.5 text-center transition-all duration-200 ${
              active
                ? 'border-champagne/40 bg-champagne/10 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:border-[#e8dcc8]/35 dark:bg-[#e8dcc8]/10 dark:text-white'
                : 'border-black/[0.06] text-muted hover:border-champagne/20 hover:bg-black/[0.02] hover:text-ink dark:border-white/[0.08] dark:hover:bg-white/[0.03] dark:hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${groupId}-active`}
                className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-champagne/30 dark:ring-[#e8dcc8]/25"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative text-[12px] font-semibold tracking-tight">{opt.label}</span>
            {opt.badge != null && (
              <span className={`relative mt-0.5 text-[10px] font-semibold ${active ? 'text-champagne' : 'text-champagne/70'}`}>
                {opt.badge}
              </span>
            )}
            {opt.sub ? <span className="relative mt-0.5 text-[9px] opacity-60">{opt.sub}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

type StudioCreditSummaryProps = {
  qualityLabel?: string
  creditCost: number | string
  credits: number
  lowBalance?: boolean
}

export function StudioCreditSummary({ qualityLabel, creditCost, credits, lowBalance = false }: StudioCreditSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-black/[0.06] bg-gradient-to-r from-[var(--card-bg)]/95 to-transparent px-4 py-3 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:from-white/[0.04]">
      {qualityLabel ? <span className="text-[11px] text-muted">{qualityLabel}</span> : null}
      <span className="text-[11px] font-semibold text-champagne">{creditCost} kredi</span>
      <span className="hidden h-3 w-px bg-black/10 dark:bg-white/10 sm:block" />
      <span className={`text-[11px] ${lowBalance ? 'font-medium text-red-500' : 'text-muted'}`}>
        Bakiye: {credits}
        {lowBalance ? ' · yetersiz' : ''}
      </span>
    </div>
  )
}

type StudioGenerateButtonProps = {
  onClick: () => void
  disabled?: boolean
  isGenerating?: boolean
  children: ReactNode
  className?: string
}

export function StudioGenerateButton({
  onClick,
  disabled = false,
  isGenerating = false,
  children,
  className = '',
}: StudioGenerateButtonProps) {
  return (
    <RippleButton
      onClick={onClick}
      disabled={disabled || isGenerating}
      rippleColor="rgba(255,255,255,0.22)"
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-zinc-900 px-5 py-3 text-[12px] font-medium uppercase tracking-[0.02em] text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-px hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-[#e8dcc8] dark:text-zinc-900 dark:shadow-[#e8dcc8]/15 dark:hover:bg-[#f0e8d8] lg:w-auto lg:min-w-[260px] lg:shrink-0 ${className}`.trim()}
    >
      {isGenerating ? (
        <>
          <Loader size={14} className="animate-spin" />
          Oluşturuluyor...
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={14} />
        </>
      )}
    </RippleButton>
  )
}
