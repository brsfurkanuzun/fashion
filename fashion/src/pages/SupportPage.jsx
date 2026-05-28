import { useState } from 'react'
import {
  BookOpen,
  Coins,
  Images,
  LifeBuoy,
  Sparkles,
  Wand2,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Reveal from '../components/Reveal'
import SectionLabel from '../components/SectionLabel'

const quickStart = [
  {
    title: '1. Çalışma alanını seçin',
    text: 'Hızlı kampanya işleri için Çekim, daha detaylı üretim akışları için Prodüksiyon sekmesini kullanın.',
  },
  {
    title: '2. Aracı başlatın',
    text: 'Sağdaki sidebar veya üstteki araç menüsünden ihtiyacınıza uygun üretim aracını seçin.',
  },
  {
    title: '3. Sonucu galeride yönetin',
    text: 'Üretimleriniz tamamlandığında Galeri alanından gözden geçirin, tekrar üretin veya teslime hazırlayın.',
  },
]

const documentationSections = [
  {
    id: 'baslarken',
    icon: Sparkles,
    title: 'Başlarken',
    intro:
      'Vibedesign stüdyosu, moda içerik üretimini tek bir akışta toplar. Çekim sekmesi daha hızlı kampanya işleri için, Prodüksiyon ise daha kontrollü ve detaylı işler için tasarlandı.',
    items: [
      'Çekim: hızlı varyasyon, sahne, poz ve hareket üretimi.',
      'Prodüksiyon: model, try-on, decoupe, editorial, pose, angle ve video akışları.',
      'Galeri: üretilen içerikleri takip etmek ve sonraki aşamaya taşımak için kullanılır.',
    ],
  },
  {
    id: 'is-akisi',
    icon: Wand2,
    title: 'Önerilen iş akışı',
    intro:
      'En iyi sonuç için önce hedefi netleştirin, ardından üretim sırasını belirleyin. Özellikle katalog ve kampanya işleri için aşağıdaki sıra önerilir.',
    items: [
      'Ürün veya kampanya hedefini tanımlayın: e-ticaret, sosyal medya, lookbook, reklam.',
      'Gerekirse önce model veya try-on ile temel görünümü kurun.',
      'Daha sonra sahne, editorial veya moodboard ile atmosferi genişletin.',
      'Son aşamada poz, açı ve video varyasyonlarıyla çıktıyı zenginleştirin.',
    ],
  },
  {
    id: 'krediler',
    icon: Coins,
    title: 'Kredi mantığı',
    intro:
      'Her üretim krediden düşer. Demo hesaplarda kredi bilgisi üst barda ve sidebar içinde görünür. Üretime başlamadan önce hangi araçların daha yoğun kredi tüketebileceğini planlamanız önerilir.',
    items: [
      'Tek görsel odaklı araçlar düşük maliyetli denemeler için uygundur.',
      'Video ve çoklu varyasyon akışları genelde daha fazla kredi gerektirir.',
      'Taslak denemeleri küçük kapsamda yapıp final üretimi sonra almak maliyeti düşürür.',
    ],
  },
  {
    id: 'galeri',
    icon: Images,
    title: 'Galeri ve teslim',
    intro:
      'Galeri, üretimlerinizi düzenleyeceğiniz merkezdir. Burada seçki yapabilir, tekrar üretim ihtiyacını belirleyebilir ve teslime uygun içerikleri ayırabilirsiniz.',
    items: [
      'Benzer varyasyonları tek oturumda üretip galeride kıyaslayın.',
      'Onaylanan görselleri kampanya veya kategori bazında gruplandırın.',
      'Revizyon ihtiyacı olan işleri tekrar stüdyoya taşıyın.',
    ],
  },
  {
    id: 'en-iyi-pratikler',
    icon: CheckCircle2,
    title: 'En iyi pratikler',
    intro:
      'Daha tutarlı sonuçlar için istemlerinizi kısa ama net tutun. Tek seferde çok fazla değişken vermek yerine, üretimi kademeli ilerletmek daha iyi sonuç verir.',
    items: [
      'Bir sahnede tek ana amaç belirleyin: ürün, model, ışık veya kompozisyon.',
      'Renk, kumaş ve siluet gibi marka detaylarını baştan net yazın.',
      'Aynı kampanya içinde tutarlılık için benzer prompt yapısını koruyun.',
      'Başarılı çıktıları referans alıp küçük varyasyonlarla ilerleyin.',
    ],
  },
]

const faqs = [
  {
    question: 'Çekim ve Prodüksiyon arasındaki fark nedir?',
    answer:
      'Çekim daha hızlı kampanya üretimleri için sadeleştirilmiş bir akıştır. Prodüksiyon ise daha detaylı araçları tek tek kontrol etmenizi sağlar.',
  },
  {
    question: 'Hangi araçla başlamalıyım?',
    answer:
      'Yeni bir konsept kuruyorsanız model veya try-on ile başlamak genelde en kolay yoldur. Mevcut görseli geliştirecekseniz editorial, pose veya angle araçlarıyla ilerleyebilirsiniz.',
  },
  {
    question: 'Galeri neden boş görünüyor?',
    answer:
      'Galeri yalnızca tamamlanmış üretimleri listeler. Demo sürümde bazı akışlar placeholder olarak durduğu için galeri hemen dolmayabilir.',
  },
  {
    question: 'Destek almak için ne yapmalıyım?',
    answer:
      'Bu sayfa ürün içi dokümantasyon merkezidir. Demo sürümde canlı ticket akışı bulunmuyor; ihtiyaç halinde önce bu sayfadaki iş akışı ve sorun giderme notlarını kontrol edin.',
  },
]

function DocSection({ icon: Icon, id, title, intro, items }) {
  return (
    <section id={id} className="scroll-mt-24 glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-subtle bg-[var(--card-bg)] text-champagne">
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-ink">{title}</h2>
          <p className="mt-3 text-sm sm:text-base text-muted font-light leading-relaxed">{intro}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 rounded-xl border border-faint bg-[var(--card-bg)] px-4 py-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-champagne" strokeWidth={1.75} />
            <p className="text-sm text-ink/90 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-faint last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-medium text-ink">{question}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`shrink-0 text-subtle transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
        <p className="pr-8 text-sm text-muted font-light leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function SupportPage() {
  const { user } = useAuth()

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs glass-card px-3 py-1.5 rounded-full text-champagne-dim mb-4">
              <LifeBuoy size={12} />
              Documentation
            </span>
            <h1 className="font-serif text-[clamp(2rem,4vw,3.2rem)] tracking-tight text-ink leading-[1.05]">
              Destek ve <em className="text-champagne not-italic">ürün dokümantasyonu</em>
            </h1>
            <p className="mt-3 text-muted font-light text-sm sm:text-base max-w-2xl leading-relaxed">
              {user?.name ? `${user.name}, ` : ''}
              stüdyoda daha hızlı ilerlemeniz için temel kullanım adımları, kredi mantığı, galeri akışı ve en iyi
              pratikleri tek sayfada topladık.
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {quickStart.map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-5">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-muted font-light leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Reveal delay={100}>
            <aside className="lg:sticky lg:top-24 h-max glass-card rounded-2xl p-5">
              <SectionLabel>İçindekiler</SectionLabel>
              <nav className="mt-5 space-y-2">
                {documentationSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-xl px-3 py-2 text-sm text-muted hover:text-ink hover:bg-[var(--card-bg)] transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>
          </Reveal>

          <div className="space-y-6">
            {documentationSections.map((section, index) => (
              <Reveal key={section.id} delay={120 + index * 40}>
                <DocSection {...section} />
              </Reveal>
            ))}
          </div>
        </div>

        <section className="mt-20 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div>
              <SectionLabel>SSS</SectionLabel>
              <h2 className="mt-6 font-serif text-3xl sm:text-4xl tracking-tight text-ink">
                Sık sorulan
                <br />
                <span className="text-champagne">sorular</span>
              </h2>
              <p className="mt-4 text-muted font-light max-w-md leading-relaxed">
                En çok karşılaşılan kullanım sorularını burada topladık. Takıldığınız yerde önce bu bölümü kontrol
                etmeniz çoğu durumda yeterli olur.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="glass-card rounded-2xl px-6 sm:px-8 shadow-sm">
              {faqs.map((faq) => (
                <FaqItem key={faq.question} {...faq} />
              ))}
            </div>
          </Reveal>
        </section>

        <Reveal delay={120}>
          <section className="mt-16 glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink flex items-center gap-2">
                  <BookOpen size={16} className="text-champagne" />
                  Bu destek alanı ürün içi dokümantasyon merkezidir
                </p>
                <p className="mt-2 text-sm text-muted font-light max-w-2xl">
                  Demo sürümde canlı ticket ve ekip içi yönlendirme akışları bağlı değil. Yeni destek maddeleri,
                  onboarding notları veya araç bazlı yardım içerikleri daha sonra bu sayfaya eklenebilir.
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  )
}
