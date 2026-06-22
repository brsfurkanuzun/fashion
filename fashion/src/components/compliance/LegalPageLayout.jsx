import { Link, useLocation } from 'react-router-dom'
import Reveal from '../Reveal'
import { SITE_NAME } from '@/lib/brand'

const LEGAL_NAV = [
  { to: '/kullanim-sartlari', label: 'Kullanım Şartları' },
  { to: '/gizlilik', label: 'Gizlilik Politikası' },
  { to: '/iade-politikasi', label: 'İade Politikası' },
  { to: '/iletisim', label: 'İletişim' },
]

export function LegalBlock({ title, children, highlight = false }) {
  return (
    <article
      className={`group rounded-2xl border p-6 sm:p-7 transition-all duration-300 ${
        highlight
          ? 'border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.06] via-[var(--card-bg)] to-transparent shadow-[0_20px_48px_-28px_rgba(6,182,212,0.35)]'
          : 'border-foreground/6 bg-[var(--card-bg)]/70 backdrop-blur-sm hover:border-foreground/12 hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20'
      }`}
    >
      {title && (
        <h2 className="mb-3 font-sans text-base font-medium tracking-tight text-ink sm:text-lg">{title}</h2>
      )}
      <div className="space-y-3 text-sm sm:text-[15px] text-muted font-light leading-relaxed">{children}</div>
    </article>
  )
}

export default function LegalPageLayout({ label, title, description, icon: Icon, children }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen">
      <div className="relative min-h-screen pb-20 pt-24">
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/[0.07] via-background to-background"
          aria-hidden
        />
        <div
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-champagne/[0.04] to-transparent dark:from-champagne/[0.06]"
          aria-hidden
        />

        <main className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <header className="relative mb-12 overflow-hidden rounded-[1.75rem] border border-foreground/6 bg-[var(--card-bg)]/50 p-8 sm:p-10 lg:mb-14 lg:p-12 backdrop-blur-md">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-champagne/10 blur-3xl"
                aria-hidden
              />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <span className="section-label mb-5">{label}</span>
                  <h1 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                    {title}
                  </h1>
                  {description && (
                    <p className="mt-4 max-w-xl text-sm sm:text-base text-muted font-light leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                {Icon && (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-foreground/8 bg-elevated/80 text-cyan-600 shadow-sm dark:text-cyan-400">
                    <Icon size={26} strokeWidth={1.5} aria-hidden />
                  </div>
                )}
              </div>

              <p className="relative mt-6 text-xs text-subtle">
                {SITE_NAME} · Son güncelleme: Haziran 2026
              </p>
            </header>
          </Reveal>

          <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)]">
            <Reveal delay={60}>
              <nav
                className="lg:sticky lg:top-28 lg:self-start"
                aria-label="Yasal sayfalar"
              >
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">Yasal</p>
                <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {LEGAL_NAV.map((item) => {
                    const active = pathname === item.to
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className={`block rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                            active
                              ? 'bg-ink text-white shadow-md dark:bg-white dark:text-zinc-950'
                              : 'text-muted hover:bg-elevated/80 hover:text-ink'
                          }`}
                          aria-current={active ? 'page' : undefined}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-4 sm:space-y-5">{children}</div>
            </Reveal>
          </div>
        </main>
      </div>
    </div>
  )
}
