import { ArrowRight, Sparkles } from 'lucide-react'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

const stats = [
  { value: '10×', label: 'Daha hızlı üretim' },
  { value: '%99', label: 'Detay sadakati' },
  { value: '∞', label: 'Sahne varyasyonu' },
]

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center pt-28 pb-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 w-full">
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
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#basla" className="btn-primary cursor-pointer">
                  Ücretsiz Dene
                  <ArrowRight size={16} strokeWidth={1.75} />
                </a>
                <a href="#ozellikler" className="btn-ghost cursor-pointer">
                  Nasıl çalışır
                </a>
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

          <div className="lg:col-span-5 relative">
            <Reveal delay={200}>
              <div className="relative">
                <div className="image-frame aspect-[4/5] shadow-2xl shadow-black/40">
                  <img
                    src="https://images.unsplash.com/photo-1469334031218-e042a776e18b?w=700&q=85"
                    alt="Editöryal sahne"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.15em] text-champagne-dim mb-1">Çıktı</p>
                      <p className="text-sm font-medium">Editöryal Sahne · Akdeniz</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs glass-card px-3 py-1.5 rounded-full">
                      <Sparkles size={12} className="text-champagne" />
                      AI
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 sm:-left-10 w-[45%] image-frame aspect-[3/4] shadow-xl shadow-black/50 ring-1 ring-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1595777457583-95e0591ff7f0?w=400&q=85"
                    alt="Ürün fotoğrafı"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-[0.6rem] uppercase tracking-wider text-champagne-dim">Kaynak</p>
                    <p className="text-xs font-medium">Ürün Fotoğrafı</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="mt-20 border-y border-faint py-4 overflow-hidden">
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
