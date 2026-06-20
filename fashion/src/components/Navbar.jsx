import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/#ozellikler', label: 'Özellikler' },
  { to: '/#adimlar', label: 'Nasıl Çalışır' },
  { to: '/#araclar', label: 'Araçlar' },
  { to: '/#motion', label: 'Motion' },
  { to: '/fiyatlandirma', label: 'Fiyatlandırma' },
  { to: '/changelog', label: 'Changelog' },
]

export default function Navbar({ onOpenLogin }) {
  const { isAuthenticated, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const handleLogin = () => {
    setOpen(false)
    onOpenLogin?.()
  }

  const navClass = scrolled ? 'glass-nav py-3' : 'py-5 bg-transparent'

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 flex items-center justify-between">
        <Link
          to="/"
          className="font-serif text-[1.5rem] sm:text-[1.55rem] tracking-tight text-ink cursor-pointer hover:opacity-80 transition-opacity duration-200"
        >
          nuladesign
        </Link>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Ana menü">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-[0.9375rem] transition-colors duration-200 cursor-pointer ${
                location.pathname === l.to
                  ? 'text-champagne'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link
                to="/studio"
                className={`text-[0.9375rem] px-4 py-2 transition-colors duration-200 cursor-pointer ${
                  location.pathname === '/studio' ? 'text-champagne' : 'text-muted hover:text-ink'
                }`}
              >
                Stüdyo
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-[0.9375rem] text-muted hover:text-ink px-4 py-2 transition-colors duration-200 cursor-pointer"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-[0.9375rem] text-muted hover:text-ink px-4 py-2 transition-colors duration-200 cursor-pointer"
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => onOpenLogin?.('register')}
                className="btn-primary text-[0.9375rem] !py-2.5 !px-5 cursor-pointer"
              >
                Başla
              </button>
            </>
          )}
        </div>

        <div className="flex sm:hidden items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 text-ink cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass-nav border-t border-faint px-5 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-base transition-colors cursor-pointer ${
                location.pathname === l.to ? 'text-champagne' : 'text-muted hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                to="/studio"
                className={`text-base transition-colors cursor-pointer ${
                  location.pathname === '/studio' ? 'text-champagne' : 'text-muted hover:text-ink'
                }`}
              >
                Stüdyo
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="text-base text-left text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLogin}
                className="text-base text-left text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenLogin?.('register')
                  setOpen(false)
                }}
                className="btn-primary w-full mt-2 cursor-pointer text-base"
              >
                Başla
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
