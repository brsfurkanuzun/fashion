import { ArrowLeftRight, Ban, CircleDollarSign, Scale, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import Reveal from '../Reveal'
import SectionLabel from '../SectionLabel'

const USAGE_RIGHT_LABEL = 'AI Görsel Üretim Hizmeti Kullanım Hakkı'

const NOT_ITEMS = [
  {
    icon: CircleDollarSign,
    title: 'Sanal para değildir',
    desc: 'Elektronik para, token, coin veya jeton niteliği taşımaz.',
  },
  {
    icon: Wallet,
    title: 'Nakde çevrilemez',
    desc: 'Parasal değeri yoktur; bakiyeye dönüştürülemez.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Transfer edilemez',
    desc: 'Kullanıcılar arasında devredilemez veya paylaşılamaz.',
  },
  {
    icon: Scale,
    title: 'Alım satıma konu değildir',
    desc: 'İkincil piyasada veya platform dışında işlem göremez.',
  },
]

const TRUST_ITEMS = [
  'Dijital hizmet satın alımı',
  'Yapay zekâ destekli görsel üretim',
  'Güvenli ödeme',
  'Kullanılmış haklar iade edilmez',
  'Yalnızca platform içi kullanım',
]

export function TrustInfoCard({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-faint bg-[var(--card-bg)]/80 px-5 py-4 shadow-sm backdrop-blur-sm ${className}`}
      role="note"
      aria-label="Satın alma bilgileri"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle mb-3">Satın alma özeti</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {TRUST_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[11px] text-muted leading-snug">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/90" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RestrictionCard({ icon: Icon, title, desc }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-faint bg-[var(--card-bg)]/60 p-4 sm:p-5 transition-all duration-300 hover:border-cyan-500/20 hover:bg-[var(--card-bg-hover)]">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-500/[0.06] blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0"
        aria-hidden
      />
      <div className="relative flex gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-faint bg-elevated/80 text-cyan-600 dark:text-cyan-400">
          <Icon size={18} strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-medium text-ink leading-snug">{title}</p>
          <p className="mt-1 text-xs text-muted font-light leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  )
}

export default function CreditsComplianceSection({ showTrustCard = false }) {
  return (
    <section
      className="max-w-[1400px] mx-auto px-5 sm:px-8 mt-16 sm:mt-24"
      aria-labelledby="credits-compliance-heading"
    >
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <Reveal className="lg:col-span-5">
          <SectionLabel>Ürün / hizmet açıklaması</SectionLabel>
          <h2
            id="credits-compliance-heading"
            className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-tight text-ink mt-5"
          >
            &ldquo;Kredi&rdquo; aslında
            <br />
            <span className="text-cyan-600 dark:text-cyan-400">kullanım hakkıdır.</span>
          </h2>
          <p className="mt-5 text-sm sm:text-[15px] text-muted font-light leading-relaxed">
            Paket satın aldığınızda elde ettiğiniz şey, platformdaki yapay zekâ görsel üretim araçlarını kullanma
            hakkıdır. Arayüzde teknik kolaylık için bu haklar kredi olarak gösterilir.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.08] px-3.5 py-1.5">
            <Sparkles size={14} className="text-cyan-600 dark:text-cyan-400 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-[11px] sm:text-xs font-medium text-ink/90 tracking-wide">{USAGE_RIGHT_LABEL}</span>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl border border-faint glass-card p-6 sm:p-8 shadow-sm">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-champagne/[0.06] dark:from-cyan-500/[0.12] dark:to-champagne/[0.04]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"
              aria-hidden
            />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <ShieldCheck size={22} strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">Satın aldığınız hizmet</p>
                <p className="mt-2 text-lg sm:text-xl font-medium text-ink leading-snug">
                  Yapay zekâ destekli dijital görsel üretim
                </p>
                <p className="mt-3 text-sm text-muted font-light leading-relaxed max-w-xl">
                  Paket fiyatları, belirli sayıda görsel üretim hakkı sağlar. Bu haklar yalnızca Nula Design stüdyo
                  araçlarında kullanılabilir; platform dışına taşınmaz.
                </p>
              </div>
            </div>

            <div className="relative mt-8 grid sm:grid-cols-2 gap-3">
              {NOT_ITEMS.map((item) => (
                <RestrictionCard key={item.title} {...item} />
              ))}
            </div>

            <div className="relative mt-6 flex items-start gap-3 rounded-2xl border border-faint/80 bg-black/[0.02] dark:bg-white/[0.03] px-4 py-3.5 sm:px-5 sm:py-4">
              <Ban size={16} className="mt-0.5 shrink-0 text-subtle" strokeWidth={1.5} aria-hidden />
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Herhangi bir finansal veya elektronik para niteliği taşımaz; yalnızca hizmet kullanım birimidir.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={140}>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-faint bg-[var(--card-bg)]/50 px-5 py-4 sm:px-6 sm:py-5 backdrop-blur-sm">
          <div>
            <p className="text-sm font-medium text-ink">İade politikası</p>
            <p className="mt-1 text-xs sm:text-sm text-muted font-light leading-relaxed max-w-2xl">
              Kullanılmış haklar iade edilemez. Kullanılmamış haklar için talepler değerlendirilir.
            </p>
          </div>
          <a
            href="/iade-politikasi"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-faint bg-elevated/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-ink transition-colors hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            İade politikasını oku
          </a>
        </div>
      </Reveal>

      {showTrustCard && (
        <Reveal delay={180}>
          <TrustInfoCard className="mt-6" />
        </Reveal>
      )}
    </section>
  )
}

export { USAGE_RIGHT_LABEL }
