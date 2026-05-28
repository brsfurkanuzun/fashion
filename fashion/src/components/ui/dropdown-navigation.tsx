import { useState } from 'react'
import type { ElementType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export type NavSubMenuItem = {
  label: string
  description: string
  icon: ElementType
  id?: string
}

export type NavSubMenu = {
  title: string
  items: NavSubMenuItem[]
}

export type NavItem = {
  id: number
  label: string
  subMenus?: NavSubMenu[]
  link?: string
}

type DropdownNavigationProps = {
  navItems: NavItem[]
  onItemSelect?: (itemId: string, parentLabel: string) => void
  onNavClick?: (navItem: NavItem) => void
  className?: string
}

export function DropdownNavigation({ navItems, onItemSelect, onNavClick, className = '' }: DropdownNavigationProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isHover, setIsHover] = useState<number | null>(null)

  const handleHover = (menuLabel: string | null) => {
    setOpenMenu(menuLabel)
  }

  return (
    <nav className={`relative w-full flex items-center justify-center ${className}`}>
      <ul className="relative flex flex-wrap items-center justify-center gap-0">
        {navItems.map((navItem) => (
          <li
            key={navItem.label}
            className="relative"
            onMouseEnter={() => handleHover(navItem.label)}
            onMouseLeave={() => handleHover(null)}
          >
            {navItem.link && !navItem.subMenus ? (
              <a
                href={navItem.link}
                className="text-sm py-1.5 px-4 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-muted-foreground hover:text-foreground relative"
                onMouseEnter={() => setIsHover(navItem.id)}
                onMouseLeave={() => setIsHover(null)}
              >
                <span>{navItem.label}</span>
                {(isHover === navItem.id) && (
                  <motion.div
                    layoutId="nav-hover-bg"
                    className="absolute inset-0 size-full bg-primary/10"
                    style={{ borderRadius: 99 }}
                  />
                )}
              </a>
            ) : (
              <button
                type="button"
                className="text-sm py-1.5 px-4 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-muted-foreground hover:text-foreground relative"
                onMouseEnter={() => setIsHover(navItem.id)}
                onMouseLeave={() => setIsHover(null)}
                onClick={() => {
                  if (!navItem.subMenus) {
                    onNavClick?.(navItem)
                  }
                }}
              >
                <span>{navItem.label}</span>
                {navItem.subMenus && (
                  <ChevronDown
                    className={`h-4 w-4 group-hover:rotate-180 duration-300 transition-transform ${
                      openMenu === navItem.label ? 'rotate-180' : ''
                    }`}
                  />
                )}
                {(isHover === navItem.id || openMenu === navItem.label) && (
                  <motion.div
                    layoutId="nav-hover-bg"
                    className="absolute inset-0 size-full bg-primary/10"
                    style={{ borderRadius: 99 }}
                  />
                )}
              </button>
            )}

            <AnimatePresence>
              {openMenu === navItem.label && navItem.subMenus && (
                <div className="w-auto absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                  <motion.div
                    className="bg-background border border-border shadow-xl p-4 w-max"
                    style={{ borderRadius: 16 }}
                    layoutId="studio-menu"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-fit shrink-0 flex flex-col sm:flex-row gap-8 sm:space-x-9 overflow-hidden">
                      {navItem.subMenus.map((sub) => (
                        <motion.div layout className="w-full min-w-[180px]" key={sub.title}>
                          <h3 className="mb-4 text-sm font-medium capitalize text-muted-foreground">
                            {sub.title}
                          </h3>
                          <ul className="space-y-4">
                            {sub.items.map((item) => {
                              const Icon = item.icon
                              const itemKey = item.id || item.label
                              return (
                                <li key={itemKey}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onItemSelect?.(itemKey, navItem.label)
                                      setOpenMenu(null)
                                    }}
                                    className="flex items-start space-x-3 group text-left w-full cursor-pointer"
                                  >
                                    <div className="border border-border text-foreground rounded-md flex items-center justify-center size-9 shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                                      <Icon className="h-5 w-5 flex-none" />
                                    </div>
                                    <div className="leading-5 w-max">
                                      <p className="text-sm font-medium text-foreground shrink-0">
                                        {item.label}
                                      </p>
                                      <p className="text-xs text-muted-foreground shrink-0 group-hover:text-foreground transition-colors duration-300">
                                        {item.description}
                                      </p>
                                    </div>
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </nav>
  )
}
