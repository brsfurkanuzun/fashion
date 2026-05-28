import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Minus, ChevronDown } from 'lucide-react'
import { ModernPricingPage } from '@/components/ui/animated-glassy-pricing'
import Reveal from '../components/Reveal'
import SectionLabel from '../components/SectionLabel'

const comparison = [
  { feature: 'Aylık görsel kotası', starter: '50', pro: '500', enterprise: 'Sınırsız' },
  { feature: 'Sanal model', starter: true, pro: true, enterprise: true },
  { feature: 'Detay koruma', starter: false, pro: true, enterprise: true },
  { feature: 'Motion video', starter: false, pro: true, enterprise: true },
  { feature: 'Mekan render', starter: false, pro: true, enterprise: true },
  { feature: 'Decoupe', starter: false, pro: true, enterprise: true },
  { feature: '4K çıktı', starter: false, pro: true, enterprise: true },
  { feature: 'API erişimi', starter: false, pro: false, enterprise: true },
  { feature: 'Öncelikli destek', starter: false, pro: true, enterprise: true },
]

const faqs = [
  {
    q: 'Kredi sistemi nasıl çalışır?',
    a: 'Her üretilen görsel 1 kredi harcar. Motion videolar 3 kredi, mekan render 2 kredi tüketir. Kullanılmayan krediler ay sonunda sıfırlanır.',
  },
  {
    q: 'Planımı istediğim zaman değiştirebilir miyim?',
    a: 'Evet. Yükseltme anında geçerli olur. Düşürme ise mevcut fatura döneminin sonunda uygulanır.',
  },
  {
    q: 'Yıllık planda indirim var mı?',
    a: 'Yıllık ödemede %20 indirim uygulanır. Fiyatlar aylık eşdeğer olarak gösterilir.',
  },
  {
    q: 'Kurumsal plan için demo alabilir miyim?',
    a: 'Evet. İletişim formu üzerinden ekibimiz size özel bir demo ve fiyat teklifi sunar.',
  },
]

function CellValue({ value }) {
  if (value === true) return <Check size={18} className="text-cyan-500 mx-auto" strokeWidth={1.75} />
  if (value === false) return <Minus size={16} className="text-subtle mx-auto" strokeWidth={1.5} />
  return <span className="text-sm text-muted">{value}</span>
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-faint last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-medium text-ink group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-subtle transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-muted font-light leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const navigate = useNavigate()
  const goStart = useCallback(() => navigate('/#basla'), [navigate])

  const plans = useMemo(
    () => [
      {
        planName: 'Başlangıç',
        description: 'Markanızı keşfetmek için ideal.',
        price: '₺0',
        priceSuffix: '/ay',
        features: [
          '50 görsel / ay',
          'Sanal model oluşturma',
          'Temel sahne şablonları',
          'Topluluk desteği',
        ],
        buttonText: 'Ücretsiz Başla',
        buttonVariant: 'secondary',
        onButtonClick: goStart,
      },
      {
        planName: 'Profesyonel',
        description: 'Büyüyen markalar ve e-ticaret için.',
        price: yearly ? '₺719' : '₺899',
        priceSuffix: '/ay',
        features: [
          '500 görsel / ay',
          'Detay koruma teknolojisi',
          'Motion & video çıktı',
          'Decoupe & poz varyasyonları',
          '4K çözünürlük',
          'Öncelikli destek',
        ],
        buttonText: "Pro'ya Geç",
        isPopular: true,
        buttonVariant: 'primary',
        onButtonClick: goStart,
      },
      {
        planName: 'Kurumsal',
        description: 'Ajanslar ve büyük ölçekli operasyonlar.',
        price: 'Özel',
        priceSuffix: '',
        features: [
          'Sınırsız görsel',
          'Özel API erişimi',
          'Marka kılavuzu entegrasyonu',
          'Dedicated hesap yöneticisi',
          'SLA garantisi',
        ],
        buttonText: 'İletişime Geç',
        buttonVariant: 'secondary',
        onButtonClick: goStart,
      },
    ],
    [yearly, goStart]
  )

  const billingToggle = (
    <div className="inline-flex items-center gap-3 rounded-full p-1.5 border border-subtle glass-card shadow-sm">
      <button
        type="button"
        onClick={() => setYearly(false)}
        className={`px-5 py-2 text-sm rounded-full transition-all duration-200 cursor-pointer ${
          !yearly ? 'btn-primary !py-2 !px-5 text-[0.8125rem]' : 'text-muted hover:text-ink'
        }`}
      >
        Aylık
      </button>
      <button
        type="button"
        onClick={() => setYearly(true)}
        className={`px-5 py-2 text-sm rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2 ${
          yearly ? 'btn-primary !py-2 !px-5 text-[0.8125rem]' : 'text-muted hover:text-ink'
        }`}
      >
        Yıllık
        <span className="text-[0.65rem] uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full">
          -%20
        </span>
      </button>
    </div>
  )

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <ModernPricingPage
        embedded
        showAnimatedBackground={false}
        title={
          <>
            İşinize uygun <span className="text-cyan-500 dark:text-cyan-400">planı</span> seçin
          </>
        }
        subtitle="Ücretsiz başlayın, büyüdükçe ölçeklendirin. Şeffaf fiyatlandırma, gizli ücret yok."
        plans={plans}
        headerExtra={billingToggle}
      />

      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 mt-20 sm:mt-28">
        <Reveal>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-center text-ink mb-12">
            Planları <span className="text-cyan-500 dark:text-cyan-400">karşılaştırın</span>
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-faint bg-[var(--card-bg)]">
                  <th className="text-left p-5 sm:p-6 text-sm font-medium text-muted w-[40%]">Özellik</th>
                  <th className="p-5 sm:p-6 text-sm font-medium text-center text-ink">Başlangıç</th>
                  <th className="p-5 sm:p-6 text-sm font-medium text-center text-cyan-600 dark:text-cyan-400">Profesyonel</th>
                  <th className="p-5 sm:p-6 text-sm font-medium text-center text-ink">Kurumsal</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-[var(--card-bg)]' : ''}>
                    <td className="p-5 sm:p-6 text-sm text-ink">{row.feature}</td>
                    <td className="p-5 sm:p-6 text-center">
                      <CellValue value={row.starter} />
                    </td>
                    <td className="p-5 sm:p-6 text-center">
                      <CellValue value={row.pro} />
                    </td>
                    <td className="p-5 sm:p-6 text-center">
                      <CellValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 mt-24 sm:mt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <Reveal>
            <div>
              <SectionLabel>SSS</SectionLabel>
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mt-6 text-ink">
                Sık sorulan
                <br />
                <span className="text-cyan-500 dark:text-cyan-400">sorular</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="glass-card rounded-2xl px-6 sm:px-8 shadow-sm">
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
