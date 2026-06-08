import { Clock3 } from 'lucide-react'
import Reveal from '../components/Reveal'

const changelogGroups = [
  {
    date: 'May 26, 2026',
    entries: [
      {
        title: '[App] Sağ Sidebar ve Profil Menüsü Yenilendi',
        body: 'Stüdyo navigasyonu sağ tarafa taşındı ve daha temiz bir hesap menüsü ile güncellendi.',
        bullets: [
          'Slim sidebar yapısı sağ kenara alındı.',
          'Profil menüsüne Account, Billing, Changelog ve tema seçimi eklendi.',
          'Dark mode ile sidebar renkleri senkron hale getirildi.',
        ],
      },
      {
        title: '[App] Destek, Account ve Billing Sayfaları Eklendi',
        body: 'Stüdyo içinden erişilebilen yardımcı sayfalar kuruldu ve temel kullanıcı akışları netleştirildi.',
        bullets: [
          'Support için ürün içi dokümantasyon sayfası hazırlandı.',
          'Account ekranı yeni kart yapısı ve danger zone bölümüyle tasarlandı.',
          'Billing için ayrı hesap ekranı oluşturuldu.',
        ],
      },
    ],
  },
  {
    date: 'May 25, 2026',
    entries: [
      {
        title: '[Studio] Çekim ve Prodüksiyon Akışları Ayrıştırıldı',
        body: 'Moda stüdyosu, daha hızlı kullanım için iki farklı çalışma alanına bölündü.',
        bullets: [
          'Çekim sekmesi hızlı kampanya üretimleri için optimize edildi.',
          'Prodüksiyon sekmesi detaylı araç seti ile genişletildi.',
          'Araçlar dropdown ve sidebar üzerinden daha düzenli hale getirildi.',
        ],
      },
      {
        title: '[App] Galeri ve Korumalı Rotalar İyileştirildi',
        body: 'Giriş yapmış kullanıcılar için stüdyo, galeri ve yardımcı ekranların erişim akışı düzenlendi.',
        bullets: [
          'Galeri sayfası protected route altında çalışacak şekilde güncellendi.',
          'Stüdyo shell içinde özel header ve sidebar düzeni korundu.',
        ],
      },
    ],
  },
  {
    date: 'May 24, 2026',
    entries: [
      {
        title: '[Pricing] Fiyatlandırma Sayfası ve Plan Yapısı Güncellendi',
        body: 'Paketler, karşılaştırma tablosu ve SSS ile daha okunabilir bir fiyatlandırma deneyimi hazırlandı.',
        bullets: [
          'Modern pricing kartları ana yapıya entegre edildi.',
          'Karşılaştırma tablosu ve sık sorulan sorular bölümü eklendi.',
          'Aylık / yıllık görünüm akışı iyileştirildi.',
        ],
      },
      {
        title: '[Auth] Tema ve Giriş Akışı Düzenlendi',
        body: 'Tema kalıcılığı ve demo giriş deneyimi güçlendirildi.',
        bullets: [
          'Dark / light mode tercihi localStorage ile korunuyor.',
          'Demo auth akışı stüdyo yönlendirmesiyle sadeleştirildi.',
        ],
      },
    ],
  },
]

function ChangelogEntry({ title, body, bullets }) {
  return (
    <article className="group rounded-2xl border border-foreground/5 bg-background p-6 transition-all duration-200 hover:border-foreground/10 hover:shadow-lg hover:shadow-primary/5 lg:p-8">
      <h3 className="mb-4 font-sans text-xl font-medium leading-tight text-foreground transition-colors group-hover:text-champagne lg:text-2xl">
        {title}
      </h3>

      <div className="prose prose-base max-w-none text-foreground leading-relaxed prose-p:text-foreground/70 prose-strong:text-foreground prose-li:text-foreground/70">
        <p>{body}</p>
        <ul className="list-disc list-outside pl-5">
          {bullets.map((item) => (
            <li key={item} className="my-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-background selection:bg-primary/10">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-champagne/10 via-background to-background opacity-60" />

        <main className="container mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-20">
          <Reveal>
            <section className="relative mb-16 flex h-[400px] w-full items-center justify-center overflow-hidden rounded-[2.5rem] border border-foreground/5 shadow-2xl shadow-black/5 lg:mb-24 lg:h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80"
                alt="Changelog Hero"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-stone-700/45" />

              <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center lg:px-8">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <Clock3 className="h-4 w-4" />
                  Product Updates
                </div>
                <h1 className="mb-6 text-4xl font-medium tracking-tight text-white lg:text-[56px] lg:leading-[1.1]">
                  What&apos;s new at <span className="font-serif italic opacity-90">nuladesign</span>
                </h1>
                <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/90 drop-shadow-md">
                  Şimdilik bu alan deneme içerikleriyle çalışıyor. Sonraki adımda changelog kayıtlarını backend&apos;den
                  okuyacağız.
                </p>
              </div>
            </section>
          </Reveal>

          <div className="space-y-12">
            {changelogGroups.map((group, groupIndex) => (
              <Reveal key={group.date} delay={groupIndex * 60}>
                <section className="relative">
                  <div className="flex gap-6 lg:gap-10">
                    <div className="hidden lg:flex flex-col items-center pt-1">
                      <div className="h-3 w-3 flex-shrink-0 rounded-full bg-champagne ring-4 ring-champagne/10" />
                      <div className="min-h-[40px] w-px flex-1 bg-gradient-to-b from-champagne/30 to-transparent" />
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-champagne lg:hidden" />
                        <div className="inline-flex items-center rounded-full border border-foreground/10 bg-muted/30 px-2.5 py-0.5 text-sm font-medium text-foreground/70">
                          {group.date}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {group.entries.map((entry) => (
                          <ChangelogEntry key={entry.title} {...entry} />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </Reveal>
            ))}

            <div className="h-4" />
          </div>
        </main>
      </div>
    </div>
  )
}
