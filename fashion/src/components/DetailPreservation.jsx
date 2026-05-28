import { Shield } from 'lucide-react'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

const details = [
  {
    title: 'Editöryal Sahne',
    desc: 'Kayalık sahil, doğal ışık',
    img: 'https://images.unsplash.com/photo-1515886657611-9c9bdaddf416?w=500&q=85',
    span: 'col-span-2 row-span-2',
  },
  {
    title: 'İşleme Detayı',
    desc: 'Boncuk işlemeler birebir korundu',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=85',
    span: 'col-span-1',
  },
  {
    title: 'Sırt Detayı',
    desc: 'Çapraz askı ve sırt dekoltesi',
    img: 'https://images.unsplash.com/photo-1496747611176-843222e1e14c?w=400&q=85',
    span: 'col-span-1',
  },
  {
    title: 'Etek Detayı',
    desc: 'Boncuk dağılımı ve kumaş dokusu',
    img: 'https://images.unsplash.com/photo-1539008835657-9e8e96875951?w=400&q=85',
    span: 'col-span-2',
  },
]

export default function DetailPreservation() {
  return (
    <section id="ozellikler" className="py-28 sm:py-36">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <Reveal>
            <SectionLabel>Detay Koruma Teknolojisi</SectionLabel>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-serif text-[clamp(2rem,5vw,3.75rem)] leading-[1.08] mt-6 tracking-tight">
              Peki detaylar?
              <br />
              <em className="text-champagne not-italic">Kusursuz korunur.</em>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-muted leading-relaxed font-light">
              Her boncuk, her dikiş aynen korunur. Aynı elbise — tamamen farklı dünyalar.
            </p>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[180px] sm:auto-rows-[220px]">
            {details.map((d, i) => (
              <article
                key={d.title}
                className={`group relative image-frame overflow-hidden cursor-default ${d.span} ${
                  i === 0 ? 'min-h-[360px] sm:min-h-[460px]' : ''
                }`}
              >
                <img
                  src={d.img}
                  alt={d.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <span className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.12em] text-champagne-dim mb-2">
                    <Shield size={11} strokeWidth={1.5} />
                    Detay Koruma
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl">{d.title}</h3>
                  <p className="text-sm text-muted mt-1 font-light">{d.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-12 grid md:grid-cols-2 gap-6 items-center glass-card rounded-2xl p-6 sm:p-8">
            <div className="image-frame aspect-square max-w-xs mx-auto md:mx-0">
              <img
                src="https://images.unsplash.com/photo-1595777457583-95e0591ff7f0?w=500&q=85"
                alt="Orijinal ürün"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="section-label !text-champagne mb-4">Karşılaştırma</p>
              <h3 className="font-serif text-2xl sm:text-3xl mb-3">Orijinal ürün → Editöryal sahne</h3>
              <p className="text-muted font-light leading-relaxed">
                Tek ürün fotoğrafından üretilen her sahne, boncuk işlemelerden kumaş dokusuna kadar piksel düzeyinde sadık kalır.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
