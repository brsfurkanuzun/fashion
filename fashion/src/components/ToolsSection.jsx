import { Scissors, RefreshCw, Rotate3d, Wand2, ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

const tools = [
  {
    icon: Scissors,
    name: 'Decoupe',
    desc: 'Manken çıkar, ürünü öne çıkar.',
  },
  {
    icon: RefreshCw,
    name: 'Poz Varyasyonları',
    desc: 'Tek çekimden sınırsız poz.',
  },
  {
    icon: Rotate3d,
    name: 'Açı Varyasyonları',
    desc: 'Ön, arka, yan — her açıdan.',
  },
  {
    icon: Wand2,
    name: 'Editör',
    desc: 'Moda için piksel düzeyinde kontrol.',
  },
]

export default function ToolsSection() {
  return (
    <section id="araclar" className="py-28 sm:py-36">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <Reveal>
              <SectionLabel>Araçlar</SectionLabel>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] mt-6 tracking-tight leading-[1.08]">
                Tek platform.
                <br />
                <em className="text-champagne not-italic">Sınırsız olasılık.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <p className="text-muted font-light max-w-sm md:text-right">
              Profesyonel moda stüdyosunun tüm araçları, tek bir arayüzde.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon
            return (
              <Reveal key={tool.name} delay={i * 60}>
                <article
                  className="group relative glass-card rounded-2xl p-7 sm:p-8 h-full flex flex-col cursor-default transition-all duration-300 hover:border-subtle hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-8">
                    <span className="flex items-center justify-center w-11 h-11 rounded-xl border border-subtle bg-[var(--card-bg)] text-champagne group-hover:border-champagne/30 transition-colors duration-300">
                      <Icon size={20} strokeWidth={1.5} />
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-subtle opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-serif text-2xl tracking-tight">{tool.name}</h3>
                  <p className="mt-3 text-sm text-muted font-light leading-relaxed flex-1">{tool.desc}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
