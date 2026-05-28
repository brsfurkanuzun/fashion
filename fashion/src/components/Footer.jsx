import { Link } from 'react-router-dom'

const links = [
  { to: '/fiyatlandirma', label: 'Fiyatlandırma' },
  { to: '#', label: 'Gizlilik' },
  { to: '#', label: 'Şartlar' },
  { to: '#', label: 'İletişim' },
]

export default function Footer() {
  return (
    <footer className="border-t border-faint py-12 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link
          to="/"
          className="font-serif text-xl tracking-tight text-ink cursor-pointer hover:opacity-80 transition-opacity duration-200"
        >
          vibedesign
        </Link>
        <p className="text-xs text-subtle order-last sm:order-none">
          © {new Date().getFullYear()} vibedesign · AI Moda Görsel Üretimi
        </p>
        <nav className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs text-muted" aria-label="Footer">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="hover:text-ink transition-colors duration-200 cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
