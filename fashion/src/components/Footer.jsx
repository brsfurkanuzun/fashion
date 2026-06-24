import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { SITE_NAME } from '@/lib/brand'

const PAYMENT_LOGO_LIGHT = '/images/logo/Colored/logo_band_colored.svg'
const PAYMENT_LOGO_DARK = '/images/logo/White/logo_band_white.svg'

const LEGAL_LINKS = [
  { to: '/kullanim-sartlari', label: 'Kullanım Şartları' },
  { to: '/gizlilik', label: 'Gizlilik' },
  { to: '/iade-politikasi', label: 'İade' },
  { to: '/iletisim', label: 'İletişim' },
]

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
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
  { to: '/gizlilik', label: 'Gizlilik Politikası' },
  { to: '/kullanim-sartlari', label: 'Kullanım Şartları' },
  { to: '/iade-politikasi', label: 'İade Politikası' },
  { to: '/iletisim', label: 'İletişim' },
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

export function FooterPaymentBand({ className = '' }) {
  const imgClass =
    'h-7 sm:h-8 w-auto max-w-[min(100%,28rem)] opacity-90'

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle">Güvenli ödeme</p>
      <img
        src={PAYMENT_LOGO_LIGHT}
        alt="Visa, Mastercard, American Express, Troy ve iyzico ile güvenli ödeme"
        width={456}
        height={32}
        className={`${imgClass} dark:hidden`}
        loading="lazy"
        decoding="async"
      />
      <img
        src={PAYMENT_LOGO_DARK}
        alt=""
        aria-hidden
        width={456}
        height={32}
        className={`${imgClass} hidden dark:block`}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

function FooterBottomBar({ year, compact = false }) {
  return (
    <div
      className={`flex flex-col gap-6 border-t border-faint pt-8 ${
        compact ? 'sm:flex-row sm:items-end sm:justify-between' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className="flex flex-col gap-4 sm:gap-3">
        <p className="text-sm text-subtle font-light">
          © {year} {SITE_NAME}. Tüm hakları saklıdır.
        </p>
        {compact && (
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Yasal">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <FooterPaymentBand className={compact ? 'sm:items-end' : ''} />
      {!compact && (
        <p className="text-center text-xs text-subtle/90 font-light tracking-wide sm:text-right max-w-md">
          Görseller örnek amaçlıdır; sonuçlar ürün ve ayarlara göre değişebilir.
        </p>
      )}
    </div>
  )
}

export default function Footer({ onOpenLogin, variant = 'default' }) {
  const year = new Date().getFullYear()
  const compact = variant === 'studio'

  if (compact) {
    return (
      <footer className="relative mt-auto border-t border-faint lg:pr-[68px]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <FooterBottomBar year={year} compact />
        </div>
      </footer>
    )
  }

  return (
    <footer className="relative mt-24 border-t border-faint transition-colors duration-300">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/35 to-transparent dark:via-champagne/25"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-px h-32 bg-gradient-to-b from-champagne/[0.04] to-transparent dark:from-champagne/[0.06]" aria-hidden />

      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 pb-10 sm:pt-20 sm:pb-12">
        <div className="grid grid-cols-1 gap-14 sm:gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div>
              <Link
                to="/"
                className="font-serif text-2xl sm:text-[1.65rem] tracking-tight text-ink inline-block cursor-pointer hover:opacity-85 transition-opacity duration-200"
              >
                {SITE_NAME}
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
                href="mailto:support@nulatechnology.com"
                className="ml-1 inline-flex items-center gap-2 rounded-xl border border-faint bg-elevated/60 px-3.5 py-2 text-sm text-muted backdrop-blur-sm transition-all duration-200 hover:border-champagne/30 hover:text-champagne"
              >
                <Mail size={16} strokeWidth={1.5} className="text-champagne-dim shrink-0" />
                E-posta
              </a>
            </div>
          </div>

          <nav className="lg:col-span-2" aria-label="Ürün">
            <FooterHeading>Ürün</FooterHeading>
            <ul className="space-y-3.5">
              {productLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[0.9375rem] text-muted font-light transition-colors duration-200 hover:text-ink cursor-pointer">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Kaynak ve yasal">
            <FooterHeading>Kaynak</FooterHeading>
            <ul className="space-y-3.5">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[0.9375rem] text-muted font-light transition-colors duration-200 hover:text-ink cursor-pointer">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

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

        <div className="mt-16">
          <FooterBottomBar year={year} />
        </div>
      </div>
    </footer>
  )
}
