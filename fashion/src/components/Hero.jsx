import { ArrowRight } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { homeImages } from '../data/homeImages'
import HeroImageCompare from './HeroImageCompare'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

const stats = [
  { value: '10×', label: 'Daha hızlı üretim' },
  { value: '%99', label: 'Detay sadakati' },
  { value: '∞', label: 'Sahne varyasyonu' },
]

export default function Hero() {
  const { openLogin } = useOutletContext() ?? {}

  return (
    <section className="relative flex flex-col overflow-hidden pb-20">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 w-full flex-1 flex flex-col justify-center pt-24 sm:pt-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionLabel>Hiper-Gerçekçi AI Fotoğrafçılık</SectionLabel>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.02] tracking-tight mt-8">
                Tek bir fotoğraftan.
                <br />
                <em className="text-gradient not-italic">Sınırsız kampanya.</em>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 text-lg text-muted max-w-lg leading-relaxed font-light">
                Stüdyo fotoğrafınız artık tek bir görsel değil — tam ölçekli, editöryal kalitede bir kampanya.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10">
                <button
                  type="button"
                  onClick={() => openLogin?.('register')}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-md ring-1 ring-black/10 transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  Hemen başla
                  <ArrowRight size={16} strokeWidth={1.75} />
                </button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-14 flex flex-wrap gap-10 pt-8 border-t border-faint">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-serif text-3xl text-champagne">{s.value}</p>
                    <p className="text-xs text-subtle mt-1 tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 relative flex min-w-0 justify-center lg:justify-end">
            <Reveal delay={200} className="min-w-0 w-full max-w-[min(100%,400px)] lg:max-w-[min(100%,400px)]">
              <div className="relative min-w-0 w-full">
                <HeroImageCompare
                  beforeSrc={homeImages.heroBanner}
                  afterSrc={homeImages.heroRedDress}
                  beforeAlt="Moda kampanya görseli — kırmızı elbise, şehir sokağı"
                  afterAlt="Decoupe — kırmızı uzun kollu elbise, stüdyo"
                  beforeLabel="Editöryal kalite"
                  afterLabel="Decoupe"
                  beforeObjectPosition="50% 18%"
                  afterObjectPosition="50% 35%"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="mt-16 sm:mt-20 border-y border-faint py-4 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0">
              {['Detay Koruma', 'Sanal Model', 'Editöryal Sahne', 'Motion', 'Mekan Render', 'Decoupe', 'Poz Varyasyonu'].map(
                (t) => (
                  <span key={`${i}-${t}`} className="mx-8 text-sm text-subtle tracking-widest uppercase">
                    {t}
                    <span className="mx-8 text-champagne-dim">·</span>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
