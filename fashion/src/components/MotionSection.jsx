import { Play, Film } from 'lucide-react'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

export default function MotionSection() {
  return (
    <section id="motion" className="py-28 sm:py-36 bg-surface-muted">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <Reveal>
              <SectionLabel>Motion</SectionLabel>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] mt-6 tracking-tight leading-[1.08]">
                Fotoğraf çekin.
                <br />
                <em className="text-champagne not-italic">Gerisini bize bırakın.</em>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-muted font-light leading-relaxed">
                Yapay zeka, ürününüzü piksel düzeyinde koruyarak doğal kumaş hareketi ve sinematik kamera açıları oluşturur. Prompt gerektirmez.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <ul className="mt-8 space-y-4">
                {['Ürün sadakati — renk, doku, detay', 'Sinematik hareket otomatik', 'Profesyonel kamera açıları'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted">
                      <span className="w-1 h-1 rounded-full bg-champagne shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="image-frame aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e0591ff7f0?w=400&q=85"
                  alt="Kaynak fotoğraf"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4">
                  <p className="text-[0.6rem] uppercase tracking-wider text-champagne-dim">Kaynak</p>
                  <p className="text-xs font-medium">Fotoğraf</p>
                </div>
              </div>
              <div className="image-frame aspect-[3/4] relative group">
                <img
                  src="https://images.unsplash.com/photo-1469334031218-e042a776e18b?w=400&q=85"
                  alt="Motion çıktısı"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
                  <button
                    type="button"
                    className="w-14 h-14 rounded-full bg-ink/95 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-champagne focus-visible:outline-offset-2"
                    aria-label="Motion önizle"
                  >
                    <Play size={20} className="text-[#030303] ml-0.5" fill="currentColor" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Film size={12} className="text-champagne" />
                  <p className="text-xs font-medium">Motion çıktısı</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
