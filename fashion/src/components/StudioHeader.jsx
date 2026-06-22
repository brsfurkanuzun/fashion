import { Link } from 'react-router-dom'
import { Coins } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { STUDIO_NAME } from '@/lib/brand'

/** Masaüstü üst bar — mobil menü SidebarNavigationSlim içinde */
export default function StudioHeader() {
  const { credits } = useAuth()

  return (
    <header className="fixed top-0 inset-x-0 z-40 glass-nav hidden lg:block lg:right-[68px]">
      <div className="h-14 px-5 sm:px-8 flex items-center justify-between">
        <Link
          to="/studio"
          className="font-serif text-xl tracking-tight text-ink transition-opacity cursor-pointer hover:opacity-80"
        >
          {STUDIO_NAME}
        </Link>

        <span
          className="flex items-center gap-1.5 text-sm text-muted tabular-nums"
          title="Kalan kredi"
        >
          <Coins size={15} className="text-champagne shrink-0" strokeWidth={1.5} />
          <span className="text-ink font-medium">{credits}</span>
          <span>kredi</span>
        </span>
      </div>
    </header>
  )
}
