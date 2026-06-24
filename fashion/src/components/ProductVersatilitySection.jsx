import { motion } from 'framer-motion'
import { homeImages } from '../data/homeImages'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

const categories = ['Giyim', 'Çiçek', 'Aksesuar', 'Kozmetik', 'Ev & Dekor', 'Objeler']

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

function InsetCard({
  label,
  step,
  src,
  alt,
  objectPosition,
  objectFit = 'cover',
  className = '',
  lightBlurBg = false,
}) {
  const isLight = lightBlurBg

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl ring-1 ${
        isLight
          ? 'border border-white/15 bg-white/[0.02] shadow-[0_20px_50px_-16px_rgba(0,0,0,0.5)] ring-white/5 backdrop-blur-2xl backdrop-saturate-150'
          : 'border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] ring-white/5'
      } ${className}`}
    >
      <div className={`relative aspect-[3/4] ${isLight ? 'overflow-hidden' : 'bg-zinc-900'}`}>
        <img
          src={src}
          alt={alt}
          className={`h-full w-full transition-transform duration-700 group-hover:scale-[1.03] ${
            objectFit === 'contain'
              ? 'relative z-[1] object-contain p-3 sm:p-4'
              : 'absolute inset-0 object-cover'
          }`}
          style={{ objectPosition }}
          loading="lazy"
        />
        {!isLight && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        )}
        {isLight && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        )}
      </div>
      <figcaption className="absolute bottom-0 inset-x-0 z-[3] flex items-end justify-between gap-2 p-3 sm:p-4">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-champagne-dim">{step}</p>
          <p className="mt-0.5 font-serif text-base sm:text-lg text-white leading-tight">{label}</p>
        </div>
        {!isLight && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[0.65rem] font-medium text-white/90 backdrop-blur-sm">
            +
          </span>
        )}
      </figcaption>
    </motion.figure>
  )
}

function MergeCanvas() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-[3rem] opacity-60 blur-3xl dark:opacity-40"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(122,107,88,0.35), transparent 50%), radial-gradient(circle at 70% 80%, rgba(180,160,130,0.2), transparent 45%)',
        }}
      />

      <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
        <div className="absolute inset-0 translate-y-10 sm:translate-y-12 lg:translate-y-16">
        {/* hero result */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="peer/result absolute inset-[24%] sm:inset-[26%] lg:inset-[27%] overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl ring-1 ring-champagne/10 transition-shadow duration-500 hover:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.55)]"
        >
          <img
            src={homeImages.productSwapResult}
            alt="Model çiçek buketi tutuyor — sonuç görseli"
            className="h-full w-full object-cover"
            style={{ objectPosition: '50% 18%' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-champagne">03 · Sonuç</p>
              <p className="mt-1 font-serif text-xl sm:text-2xl text-white">Editöryal birleşim</p>
            </div>
            <span className="rounded-full border border-champagne/30 bg-champagne/15 px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-champagne backdrop-blur-sm">
              Swap
            </span>
          </div>
        </motion.div>

        {/* model inset — top left */}
        <div className="absolute left-[3%] top-[8%] z-20 w-[32%] -rotate-3 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] peer-hover/result:-translate-x-3 peer-hover/result:-translate-y-2 sm:left-[4%] sm:top-[9%] sm:w-[28%] sm:peer-hover/result:-translate-x-4 sm:peer-hover/result:-translate-y-3 lg:left-[5%] lg:top-[10%] lg:w-[26%] lg:peer-hover/result:-translate-x-6 lg:peer-hover/result:-translate-y-4">
          <InsetCard
            label="Referans model"
            step="01"
            src={homeImages.productSwapModel}
            alt="Stüdyo model referans görseli"
            objectPosition="50% 12%"
            className="w-full"
          />
        </div>

        {/* product inset — bottom left */}
        <div className="absolute left-[3%] top-[46%] z-20 w-[32%] rotate-[5deg] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] peer-hover/result:-translate-x-3 peer-hover/result:translate-y-1 sm:left-[4%] sm:top-[47%] sm:w-[28%] sm:peer-hover/result:-translate-x-4 sm:peer-hover/result:translate-y-2 lg:left-[5%] lg:top-[48%] lg:w-[26%] lg:peer-hover/result:-translate-x-6 lg:peer-hover/result:translate-y-3">
          <InsetCard
            label="Ürün"
            step="02"
            src={homeImages.productSwapProduct}
            alt="Çiçek buketi ürün fotoğrafı"
            objectFit="contain"
            lightBlurBg
            className="w-full"
          />
        </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductVersatilitySection() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-surface-muted/40 dark:bg-black/20" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(122,107,88,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(122,107,88,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 lg:gap-12 xl:gap-16 items-center">
          {/* copy */}
          <div className="lg:col-span-5 mb-14 lg:mb-0">
            <Reveal>
              <SectionLabel>Ürün Esnekliği</SectionLabel>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-serif text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.06] mt-6 tracking-tight">
                Giyimden
                <br />
                <span className="text-gradient">öteye geçin.</span>
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 text-muted leading-relaxed font-light text-[1.05rem] max-w-md">
                Aynı akış; farklı kategoriler. Model referansınız ve ürün fotoğrafınız tek karede buluşsun —
                çiçekten aksesuara, kampanya objesine kadar.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-faint bg-[var(--card-bg)]/80 px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-muted backdrop-blur-sm transition-colors hover:border-champagne/30 hover:text-ink dark:hover:text-white"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </Reveal>

            <motion.div
              custom={0.28}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-10 hidden lg:block border-l border-champagne/25 pl-5"
            >
              <p className="text-sm text-muted font-light leading-relaxed">
                <span className="text-champagne font-medium">Model + Ürün = Sonuç</span>
                <br />
                Buket örneği; swap ve try-on araçlarıyla aynı mantık tüm ürün tiplerinde çalışır.
              </p>
            </motion.div>
          </div>

          {/* visual stage */}
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <MergeCanvas />
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-8 text-center lg:text-left text-[0.7rem] uppercase tracking-[0.16em] text-subtle font-light">
                Canlı örnek · Çiçek buketi swap
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
