import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'

function InstagramIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

function LinkedinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const productLinks = [
  { to: '/#ozellikler', label: 'Özellikler' },
  { to: '/#adimlar', label: 'Nasıl çalışır' },
  { to: '/#araclar', label: 'Araçlar' },
  { to: '/#motion', label: 'Motion' },
  { to: '/fiyatlandirma', label: 'Fiyatlandırma' },
]

const resourceLinks = [
  { to: '/changelog', label: 'Changelog' },
  { to: '#', label: 'Gizlilik' },
  { to: '#', label: 'Kullanım şartları' },
]

const social = [
  { href: 'https://www.instagram.com/', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://www.linkedin.com/', label: 'LinkedIn', Icon: LinkedinIcon },
]

function FooterHeading({ children }) {
  return (
    <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-champagne-dim mb-5">{children}</p>
  )
}

export default function Footer({ onOpenLogin }) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-faint transition-colors duration-300">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/35 to-transparent dark:via-champagne/25"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-px h-32 bg-gradient-to-b from-champagne/[0.04] to-transparent dark:from-champagne/[0.06]" aria-hidden />

      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 pb-10 sm:pt-20 sm:pb-12">
        <div className="grid grid-cols-1 gap-14 sm:gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Marka */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div>
              <Link
                to="/"
                className="font-serif text-2xl sm:text-[1.65rem] tracking-tight text-ink inline-block cursor-pointer hover:opacity-85 transition-opacity duration-200"
              >
                nuladesign
              </Link>
              <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-muted font-light">
                Tek ürün fotoğrafından editöryal kampanya görselleri — stüdyo kalitesinde, dakikalar içinde.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {social.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-faint bg-elevated/60 text-muted backdrop-blur-sm transition-all duration-200 hover:border-champagne/30 hover:text-champagne hover:bg-[var(--card-bg-hover)]"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
              <a
                href="mailto:destek@nuladesign.com"
                className="ml-1 inline-flex items-center gap-2 rounded-xl border border-faint bg-elevated/60 px-3.5 py-2 text-sm text-muted backdrop-blur-sm transition-all duration-200 hover:border-champagne/30 hover:text-champagne"
              >
                <Mail size={16} strokeWidth={1.5} className="text-champagne-dim shrink-0" />
                E-posta
              </a>
            </div>
          </div>

          {/* Ürün */}
          <nav className="lg:col-span-2" aria-label="Ürün">
            <FooterHeading>Ürün</FooterHeading>
            <ul className="space-y-3.5">
              {productLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[0.9375rem] text-muted font-light transition-colors duration-200 hover:text-ink cursor-pointer"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kaynak */}
          <nav className="lg:col-span-2" aria-label="Kaynak ve yasal">
            <FooterHeading>Kaynak</FooterHeading>
            <ul className="space-y-3.5">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-[0.9375rem] text-muted font-light transition-colors duration-200 hover:text-ink cursor-pointer"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA */}
          <div className="md:col-span-2 lg:col-span-4">
            <FooterHeading>Başlayın</FooterHeading>
            <div className="rounded-2xl border border-faint bg-gradient-to-br from-elevated/90 via-[var(--card-bg)] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.45)] dark:from-elevated/40 dark:via-[var(--card-bg)] dark:to-transparent backdrop-blur-md">
              <p className="font-serif text-xl leading-snug tracking-tight text-ink">
                İlk kampanyanızı <span className="text-champagne">bugün</span> oluşturun.
              </p>
              <p className="mt-2 text-sm text-muted font-light leading-relaxed">
                Ücretsiz hesap ile kredilerinizi kullanın; stüdyoya geçiş tek tık.
              </p>
              <button
                type="button"
                onClick={() => onOpenLogin?.('register')}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white sm:w-auto sm:px-5"
              >
                Hesap oluştur
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-faint pt-8 sm:flex-row sm:items-end">
          <p className="text-center text-sm text-subtle font-light sm:text-left">
            © {year} nuladesign. Tüm hakları saklıdır.
          </p>
          <p className="text-center text-xs text-subtle/90 font-light tracking-wide sm:text-right max-w-md">
            Görseller örnek amaçlıdır; sonuçlar ürün ve ayarlara göre değişebilir.
          </p>
        </div>
      </div>
    </footer>
  )
}
