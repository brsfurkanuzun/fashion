import { useState } from 'react'
import { motion } from 'framer-motion'

export type StudioTabItem = {
  id: string
  label: string
  subtitle?: string
}

type StudioTabsProps = {
  items: StudioTabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function StudioTabs({ items, activeId, onChange, className = '' }: StudioTabsProps) {
  const [isHover, setIsHover] = useState<string | null>(null)

  return (
    <ul className={`flex items-center justify-center flex-wrap gap-1 ${className}`}>
      {items.map((item) => {
        const isActive = activeId === item.id
        return (
          <li key={item.id}>
            <button
              type="button"
              className="py-2 relative duration-300 transition-colors hover:text-foreground text-muted-foreground cursor-pointer"
              onClick={() => onChange(item.id)}
              onMouseEnter={() => setIsHover(item.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              <div className="px-5 py-2 relative">
                <span className={`font-serif text-lg tracking-tight ${isActive ? 'text-foreground' : ''}`}>
                  {item.label}
                </span>
                {item.subtitle && (
                  <span className="block text-[0.65rem] text-muted-foreground mt-0.5">{item.subtitle}</span>
                )}
                {isHover === item.id && (
                  <motion.div
                    layoutId="studio-tab-hover"
                    className="absolute inset-0 size-full bg-primary/10"
                    style={{ borderRadius: 8 }}
                  />
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="studio-tab-active"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary"
                />
              )}
              {isHover === item.id && !isActive && (
                <motion.div
                  layoutId="studio-tab-hover-line"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary/50"
                />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
