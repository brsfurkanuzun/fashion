import { User, Shirt, MapPin } from 'lucide-react'
import { homeImages } from '../data/homeImages'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

const steps = [
  {
    icon: User,
    num: '01',
    label: 'Adım 1',
    title: 'Modelinizi yaratın',
    subtitle: 'Tamamen sizin.',
    desc: 'Yüz yapısı, ten rengi, saç stili, vücut tipi — markanızın DNA\'sına uygun sanal modeller, saniyeler içinde.',
    img: homeImages.stepStudio,
  },
  {
    icon: Shirt,
    num: '02',
    label: 'Adım 2',
    title: 'Kıyafeti giydirin',
    subtitle: 'Tam istediğiniz gibi.',
    desc: 'Kumaş kıvrımları, gölgeler, ışık yansımaları — gerçek bir çekim gibi, saniyeler içinde.',
    img: homeImages.stepShopping,
  },
  {
    icon: MapPin,
    num: '03',
    label: 'Adım 3',
    title: 'Sahneye yerleştirin',
    subtitle: 'Hayal edin, gerçek olsun.',
    desc: 'Kayalık sahiller, şehir sokakları, profesyonel stüdyo — modelinizi istediğiniz ortamda konumlandırın.',
    img: homeImages.stepRunway,
  },
]

export default function StepsSection() {
  return (
    <section id="adimlar" className="py-28 sm:py-36 bg-surface-muted">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="text-center max-w-xl mx-auto mb-20">
            <SectionLabel>Nasıl Çalışır</SectionLabel>
            <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] mt-6 tracking-tight">
              Üç adımda <em className="text-champagne not-italic">stüdyo kalitesi</em>
            </h2>
          </div>
        </Reveal>

        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.num} delay={i * 80}>
                <article className="group grid lg:grid-cols-2 gap-0 glass-card rounded-2xl overflow-hidden hover:border-subtle transition-colors duration-300">
                  <div
                    className={`relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] overflow-hidden ${
                      i % 2 === 1 ? 'lg:order-2' : ''
                    }`}
                  >
                    <img
                      src={step.img}
                      alt={step.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <span className="absolute top-6 right-6 font-serif text-7xl text-white/10 select-none">
                      {step.num}
                    </span>
                  </div>

                  <div
                    className={`flex flex-col justify-center p-8 sm:p-12 lg:p-14 ${
                      i % 2 === 1 ? 'lg:order-1' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full border border-subtle text-champagne">
                        <Icon size={18} strokeWidth={1.5} />
                      </span>
                      <span className="text-xs uppercase tracking-[0.15em] text-champagne-dim">{step.label}</span>
                    </div>
                    <h3 className="font-serif text-3xl sm:text-4xl tracking-tight">
                      {step.title}
                      <br />
                      <em className="text-muted not-italic font-normal text-2xl sm:text-3xl">{step.subtitle}</em>
                    </h3>
                    <p className="mt-5 text-muted font-light leading-relaxed max-w-md">{step.desc}</p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
