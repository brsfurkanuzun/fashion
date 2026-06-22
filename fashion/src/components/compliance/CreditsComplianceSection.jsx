import Reveal from '../Reveal'
import SectionLabel from '../SectionLabel'

const TRUST_ITEMS = [
  'Dijital ürün',
  'Yapay zekâ görsel üretim hizmeti',
  'Güvenli ödeme',
  'Nakit iadesi yok',
  'Yalnızca platform kullanımı',
]

export function TrustInfoCard({ className = '' }) {
  return (
    <div
      className={`rounded-xl border border-faint bg-[var(--card-bg)]/80 px-4 py-3.5 shadow-sm ${className}`}
      role="note"
      aria-label="Satın alma bilgileri"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle mb-2.5">Satın alma özeti</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {TRUST_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[11px] text-muted leading-snug">
            <span className="h-1 w-1 shrink-0 rounded-full bg-cyan-500/80" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CreditsComplianceSection({ showTrustCard = false }) {
  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 mt-16 sm:mt-20">
      <Reveal>
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <SectionLabel>Şeffaflık</SectionLabel>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-ink mt-4 mb-3">
              Krediler nedir?
            </h2>
            <p className="text-sm sm:text-[15px] text-muted font-light leading-relaxed max-w-3xl">
              Krediler, platformda yapay zekâ destekli moda görselleri ve sanal deneme (try-on) görselleri üretmek için
              kullanılan dijital hizmet birimleridir. Her üretim, seçilen hizmete bağlı olarak belirli sayıda kredi
              tüketir.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-muted/90 leading-relaxed border-l-2 border-cyan-500/40 pl-4 max-w-3xl">
            Kredilerin parasal değeri yoktur; kullanıcılar arasında devredilemez ve nakde çevrilemez. Krediler yalnızca
            platformda sunulan hizmetlere erişmek için kullanılır.
          </p>

          <div className="pt-2 border-t border-faint">
            <h3 className="text-base sm:text-lg font-medium text-ink mb-2">İade politikası</h3>
            <p className="text-sm text-muted font-light leading-relaxed max-w-3xl">
              Dijital yapay zekâ hizmetlerinin anında teslim edilmesi ve tüketilmesi nedeniyle kullanılmış krediler
              iade edilemez. Kullanılmamış krediler için yapılan iade talepleri Kullanım Şartlarımıza göre
              değerlendirilir.
            </p>
          </div>

          {showTrustCard && <TrustInfoCard />}
        </div>
      </Reveal>
    </section>
  )
}
