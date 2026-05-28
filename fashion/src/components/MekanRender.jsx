import { Sofa, Wine, Armchair } from 'lucide-react'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

const products = [
  { icon: Sofa, name: 'Tekli Koltuk', material: 'Deri — Modern', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=85' },
  { icon: Wine, name: 'Bardak Seti', material: 'Cam — Dekoratif', img: 'https://images.unsplash.com/photo-1578508133497-8b23f20690c2?w=300&q=85' },
  { icon: Armchair, name: 'İkili Kanepe', material: 'Kumaş — Bohemian', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=300&q=85' },
]

export default function MekanRender() {
  return (
    <section className="py-28 sm:py-36">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <SectionLabel>Mekan Render</SectionLabel>
            <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] mt-6 tracking-tight">
              Her ürün <em className="text-champagne not-italic">bir mekan hak eder</em>
            </h2>
            <p className="mt-5 text-muted font-light">
              Katalog fotoğrafınızı yükleyin — yapay zeka ürününüzü ışık, gölge ve perspektifle uyumlu bir yaşam alanına yerleştirir.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible scrollbar-none">
            {products.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.name}
                  className="flex items-center gap-4 glass-card rounded-xl p-4 min-w-[260px] sm:min-w-0 shrink-0 sm:shrink cursor-default hover:border-subtle transition-colors duration-300"
                >
                  <img src={p.img} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon size={14} className="text-champagne shrink-0" strokeWidth={1.5} />
                      <h4 className="font-medium text-sm truncate">{p.name}</h4>
                    </div>
                    <p className="text-xs text-subtle">{p.material}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <div className="image-frame aspect-video group">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=85"
                alt="Kaynak ürün"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-5 left-5">
                <p className="text-[0.6rem] uppercase tracking-wider text-champagne-dim">Kaynak</p>
                <p className="text-sm font-medium">Ürün fotoğrafı</p>
              </div>
            </div>
            <div className="image-frame aspect-video group">
              <img
                src="https://images.unsplash.com/photo-1618221195710-e326f1269a1a?w=700&q=85"
                alt="Mekan render"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-5 left-5">
                <p className="text-[0.6rem] uppercase tracking-wider text-champagne">AI Render</p>
                <p className="text-sm font-medium">Yaşam alanı</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <p className="text-center text-sm text-subtle mt-10 max-w-lg mx-auto font-light">
            Modern, minimal, Bohemian, endüstriyel — tarz siz seçin. Tek fotoğraf, sınırsız mekan.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
