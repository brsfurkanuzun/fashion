import { useEffect, useState, type ElementType, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

export const AnimatedMenuToggle = ({
  toggle,
  isOpen,
}: {
  toggle: () => void
  isOpen: boolean
}) => (
  <button
    type="button"
    onClick={toggle}
    aria-label="Menüyü aç/kapat"
    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary p-1 cursor-pointer text-ink"
  >
    <motion.div animate={{ y: isOpen ? 2 : 0 }} transition={{ duration: 0.3 }}>
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
        className="text-current"
      >
        <motion.path
          fill="transparent"
          strokeWidth="2.5"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: 'M 2 2.5 L 22 2.5' },
            open: { d: 'M 3 16.5 L 17 2.5' },
          }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="2.5"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: 'M 2 12 L 22 12', opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="2.5"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: 'M 2 21.5 L 22 21.5' },
            open: { d: 'M 3 2.5 L 17 16.5' },
          }}
        />
      </motion.svg>
    </motion.div>
  </button>
)

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mb-3">
      <button
        type="button"
        className="w-full flex items-center justify-between py-2 px-2 text-sm font-medium text-ink hover:text-champagne transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-2 pl-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export type SidebarNavItem = {
  label: string
  icon: ElementType
  to?: string
  onClick?: () => void
}

export type SidebarProfile = {
  name: string
  email: string
  avatar?: ReactNode
}

export type SidebarProps = {
  open: boolean
  onClose: () => void
  profile: SidebarProfile
  navItems: SidebarNavItem[]
  headerExtra?: ReactNode
  collapsibleSections?: ReactNode
  footer?: ReactNode
  /** Masaüstünde sağda sabit panel */
  desktopFixed?: boolean
}

const panelClass =
  'flex flex-col h-full bg-elevated text-ink border-l border-subtle shadow-2xl'

const navButtonClass =
  'flex gap-3 font-medium text-sm items-center w-full py-2.5 px-2 text-muted hover:text-ink transition-colors cursor-pointer'

function SidebarPanel({
  profile,
  navItems,
  headerExtra,
  collapsibleSections,
  footer,
  onClose,
}: Omit<SidebarProps, 'open' | 'desktopFixed'>) {
  return (
    <>
      <div className="p-5 border-b border-faint shrink-0">
        <div className="flex items-center gap-3">
          {profile.avatar ?? (
            <div className="w-11 h-11 rounded-full border border-subtle bg-[var(--card-bg)] flex items-center justify-center shrink-0 text-champagne" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">{profile.name}</p>
            <p className="text-xs text-muted truncate">{profile.email}</p>
          </div>
        </div>
        {headerExtra}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon
            const content = (
              <>
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                {item.label}
              </>
            )
            return (
              <li key={item.label} className="mb-1">
                {item.to ? (
                  <Link to={item.to} onClick={onClose} className={navButtonClass}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" onClick={item.onClick} className={navButtonClass}>
                    {content}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {collapsibleSections && <div className="mt-4">{collapsibleSections}</div>}
      </nav>

      {footer && <div className="p-4 border-t border-faint shrink-0">{footer}</div>}
    </>
  )
}

export function Sidebar({
  open,
  onClose,
  profile,
  navItems,
  headerExtra,
  collapsibleSections,
  footer,
  desktopFixed = true,
}: SidebarProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const mobileVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  }

  return (
    <>
      {/* Mobil + tablet: overlay panel sağdan */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm cursor-pointer ${
                desktopFixed ? 'lg:hidden' : ''
              }`}
              onClick={onClose}
              aria-label="Menüyü kapat"
            />
            <motion.aside
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileVariants}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[280px] ${panelClass} ${
                desktopFixed ? 'lg:hidden' : ''
              }`}
              aria-label="Kenar menü"
            >
              <SidebarPanel
                profile={profile}
                navItems={navItems}
                headerExtra={headerExtra}
                collapsibleSections={collapsibleSections}
                footer={footer}
                onClose={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Masaüstü: sağda sabit sidebar */}
      {desktopFixed && (
        <aside
          className={`hidden lg:flex flex-col fixed top-14 right-0 bottom-0 w-64 z-40 ${panelClass}`}
          aria-label="Kenar menü"
        >
          <SidebarPanel
            profile={profile}
            navItems={navItems}
            headerExtra={headerExtra}
            collapsibleSections={collapsibleSections}
            footer={footer}
            onClose={onClose}
          />
        </aside>
      )}
    </>
  )
}
