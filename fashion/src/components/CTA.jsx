import { ArrowRight } from 'lucide-react'
import Reveal from './Reveal'

export default function CTA() {
  return (
    <section id="basla" className="py-28 sm:py-36">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-subtle">
            <div className="absolute inset-0 mesh-bg" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />

            <div className="relative px-8 py-20 sm:px-16 sm:py-28 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne-dim mb-6">Hemen başlayın</p>
              <h2 className="font-serif text-[clamp(2.25rem,6vw,4.5rem)] tracking-tight leading-[1.05] max-w-3xl mx-auto">
                İlk görselinizi
                <br />
                <em className="text-gradient not-italic">oluşturun.</em>
              </h2>
              <p className="mt-6 text-muted font-light max-w-md mx-auto">
                Stüdyo kalitesinde fotoğraflar, saniyeler içinde. Kredi kartı gerekmez.
              </p>
              <a href="#" className="btn-primary mt-10 cursor-pointer">
                Ücretsiz Başla
                <ArrowRight size={16} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
