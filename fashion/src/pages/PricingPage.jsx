import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Minus, ChevronDown } from 'lucide-react'
import { ModernPricingPage } from '@/components/ui/animated-glassy-pricing'
import Reveal from '../components/Reveal'
import SectionLabel from '../components/SectionLabel'

const nfTry = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })
const nfInt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 })

/** Profesyonel: sabit TL + yuvarlak kredi tablosu */
const PRO_TIERS = [
  { tl: 1000, credits: 2500 },
  { tl: 2000, credits: 5000 },
  { tl: 3000, credits: 7500 },
  { tl: 5000, credits: 15000 },
  { tl: 10000, credits: 35000 },
  { tl: 15000, credits: 55000 },
  { tl: 20000, credits: 75000 },
]

const comparison = [
  { feature: 'Ödeme modeli', starter: 'Tek sefer', pro: 'Tek sefer (paket)', enterprise: 'Özel anlaşma' },
  { feature: 'Kredi bakiyesi', starter: '1.000', pro: '2.500 – 75.000', enterprise: 'Özel' },
  { feature: 'FAST & PRO araçları', starter: true, pro: true, enterprise: true },
  { feature: 'Detay koruma', starter: true, pro: true, enterprise: true },
  { feature: 'Motion / video', starter: true, pro: true, enterprise: true },
  { feature: '4K kalite seçenekleri', starter: true, pro: true, enterprise: true },
  { feature: 'API erişimi', starter: false, pro: false, enterprise: true },
  { feature: 'Öncelikli destek', starter: false, pro: true, enterprise: true },
]

const faqs = [
  {
    q: 'Kredi nasıl harcanır?',
    a: 'Her üretimde kullandığınız araç ve çözünürlük (ör. 1K / 2K / 4K) farklı kredi maliyeti taşır. Üretim başlamadan maliyet ekranda görünür.',
  },
  {
    q: 'Başlangıç paketi kime uygun?',
    a: 'Stüdyoyu denemek isteyenler için: tek seferde 500 TL karşılığında 1.000 kredi. Araçları gerçek iş akışında test edebilirsiniz.',
  },
  {
    q: 'Profesyonel pakette slider ne işe yarar?',
    a: 'Sabit fiyat kademelerinden birini seçersiniz (1.000 TL–20.000 TL). Her kademenin kredi miktarı tabloda sabit; en yüksek paket 20.000 TL için 75.000 kredi.',
  },
  {
    q: 'Kurumsal ihtiyaçlar için?',
    a: 'Yüksek hacim, SLA veya API için bizimle iletişime geçin; size özel kredi ve fiyat teklifi hazırlarız.',
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
  const [proTierIndex, setProTierIndex] = useState(0)
  const navigate = useNavigate()
  const goStart = useCallback(() => navigate('/#basla'), [navigate])

  const proTier = PRO_TIERS[proTierIndex]
  const proTl = proTier.tl
  const proCredits = proTier.credits

  const plans = useMemo(
    () => [
      {
        planName: 'Başlangıç',
        description: 'Ürünü ve stüdyoyu denemek için tek seferlik paket.',
        price: nfTry.format(500),
        priceSuffix: 'tek sefer',
        features: [
          '1.000 kredi',
          'FAST & PRO araçlarına erişim',
          'Gerçek üretimle risksiz deneme',
          'Kredi, seçtiğiniz araç ve kaliteye göre harcanır',
        ],
        buttonText: 'Satın Al',
        buttonVariant: 'secondary',
        onButtonClick: goStart,
      },
      {
        planName: 'Profesyonel',
        description: 'İhtiyacınıza göre paket büyüklüğünü seçin.',
        price: '',
        priceSuffix: '',
        priceSection: (
          <div className="w-full text-left space-y-4">
            <div>
              <div className="text-[44px] sm:text-[48px] font-extralight tracking-[-0.03em] text-foreground font-display leading-none">
                {nfTry.format(proTl)}
              </div>
              <p className="mt-2 text-[15px] text-foreground/80 font-sans">
                <span className="font-medium text-cyan-600 dark:text-cyan-400">{nfInt.format(proCredits)}</span>{' '}
                kredi
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="pro-credit-slider" className="sr-only">
                Profesyonel paket tutarı ve kredi miktarı
              </label>
              <input
                id="pro-credit-slider"
                type="range"
                min={0}
                max={PRO_TIERS.length - 1}
                step={1}
                value={proTierIndex}
                onChange={(e) => setProTierIndex(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-black/10 dark:bg-white/15 accent-cyan-500"
              />
              <div className="flex justify-between gap-2 text-[11px] sm:text-xs text-foreground/60 font-sans leading-tight">
                <span>
                  {nfTry.format(PRO_TIERS[0].tl)} · {nfInt.format(PRO_TIERS[0].credits)} kredi
                </span>
                <span>
                  {nfTry.format(PRO_TIERS[PRO_TIERS.length - 1].tl)} ·{' '}
                  {nfInt.format(PRO_TIERS[PRO_TIERS.length - 1].credits)} kredi
                </span>
              </div>
            </div>
          </div>
        ),
        features: [
          'Ödeme: seçtiğiniz paket tutarı (tek sefer)',
          'Kredi: 1.000 – 20.000 TL arası 7 sabit paket',
          'Tüm PRO ve FAST üretim araçları',
          'Öncelikli destek',
        ],
        buttonText: "Paketi Seç",
        isPopular: true,
        buttonVariant: 'primary',
        onButtonClick: goStart,
      },
      {
        planName: 'Kurumsal',
        description: 'Ajanslar ve yüksek hacimli ekipler.',
        price: 'Özel',
        priceSuffix: '',
        features: ['Özel kredi ve fiyat', 'API erişimi', 'SLA ve sözleşme', 'Dedicated hesap yöneticisi'],
        buttonText: 'İletişime Geç',
        buttonVariant: 'secondary',
        onButtonClick: goStart,
      },
    ],
    [goStart, proTierIndex, proTl, proCredits]
  )

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <ModernPricingPage
        embedded
        showAnimatedBackground={false}
        title={
          <>
            Krediyle <span className="text-cyan-500 dark:text-cyan-400">ölçeklenen</span> paketler
          </>
        }
        subtitle="Parayı doğrudan krediye çevirirsiniz; üretimler araç ve kaliteye göre kredi harcar. Başlangıç paketi deneme, Profesyonel’de tutarı siz seçersiniz."
        plans={plans}
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
