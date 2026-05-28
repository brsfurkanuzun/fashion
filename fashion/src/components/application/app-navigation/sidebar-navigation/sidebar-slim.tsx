import type { FC } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DotsVertical, LifeBuoy01, LogOut01, Settings01 } from '@untitledui/icons'
import { CreditCard, List, LogOut, Moon, Sun, User } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from 'react-aria-components'
import { Avatar } from '@/components/base/avatar/avatar'
import { ButtonUtility } from '@/components/base/buttons/button-utility'
import { UntitledLogo } from '@/components/foundations/logo/untitledui-logo'
import { UntitledLogoMinimal } from '@/components/foundations/logo/untitledui-logo-minimal'
import { cx } from '@/lib/utils/cx'
import { useTheme } from '@/context/ThemeContext'
import { MobileNavigationHeader } from '../base-components/mobile-header'
import { NavButton } from '../base-components/nav-button'
import { NavItemBase } from '../base-components/nav-item'
import { NavList } from '../base-components/nav-list'
import type { NavItemType } from '../config'

type NavItemWithIcon = NavItemType & { icon: FC<{ className?: string }> }

export type SidebarAccount = {
  name: string
  email: string
  avatarUrl?: string
  onLogout?: () => void
}

export interface SidebarNavigationSlimProps {
  activeUrl?: string
  items: NavItemWithIcon[]
  footerItems?: NavItemWithIcon[]
  hideBorder?: boolean
  hideRightBorder?: boolean
  account?: SidebarAccount
}

export const SidebarNavigationSlim = ({
  activeUrl: activeUrlProp,
  items,
  footerItems = [],
  hideBorder,
  hideRightBorder,
  account,
}: SidebarNavigationSlimProps) => {
  const location = useLocation()
  const { isDark, setTheme } = useTheme()
  const activeUrl = activeUrlProp ?? `${location.pathname}${location.search}`

  const activeItem = [...items, ...footerItems].find(
    (item) =>
      item.href === activeUrl ||
      item.items?.some((subItem) => subItem.href === activeUrl || activeUrl.startsWith(subItem.href))
  )
  const [currentItem, setCurrentItem] = useState(activeItem ?? items[0])
  const [isHovering, setIsHovering] = useState(false)

  const isSecondarySidebarVisible = isHovering && Boolean(currentItem?.items?.length)

  const MAIN_SIDEBAR_WIDTH = 68
  const SECONDARY_SIDEBAR_WIDTH = 256

  const avatarSrc =
    account?.avatarUrl ??
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face'

  const mainSidebar = (
    <aside
      style={{ width: MAIN_SIDEBAR_WIDTH }}
      className={cx(
        'group flex h-full max-h-full max-w-full overflow-y-auto py-1 pr-1 transition duration-100 ease-linear',
        isSecondarySidebarVisible && 'bg-white dark:bg-[#0f0f10]'
      )}
    >
      <div
        className={cx(
          'flex w-auto flex-col justify-between rounded-xl bg-white pt-5 ring-1 ring-[rgba(0,0,0,0.08)] transition duration-300 ring-inset dark:bg-[#141414] dark:ring-white/[0.08]',
          hideBorder && !isSecondarySidebarVisible && 'ring-transparent'
        )}
      >
        <div className="flex justify-center px-3">
          <Link to="/fashion" title="Fashion" className="outline-hidden">
            <UntitledLogoMinimal className="size-6" />
          </Link>
        </div>

        <ul className="mt-5 flex flex-col gap-0.5 px-3.5">
          {items.map((item) => (
            <li key={item.label}>
              <NavButton
                current={currentItem?.label === item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                tooltipPlacement="left"
                onClick={() => setCurrentItem(item)}
              />
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col items-center gap-3 px-3 py-4">
          {footerItems.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {footerItems.map((item) => (
                <li key={item.label}>
                  <NavButton
                    current={currentItem?.label === item.label}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    tooltipPlacement="left"
                    onClick={() => setCurrentItem(item)}
                  />
                </li>
              ))}
            </ul>
          )}

          <AriaDialogTrigger>
            <AriaButton
              className={({ isPressed, isFocused }) =>
                cx(
                  'group relative inline-flex rounded-full',
                  (isPressed || isFocused) && 'outline-2 outline-offset-2 outline-focus-ring'
                )
              }
            >
              <Avatar border src={avatarSrc} size="md" alt={account?.name ?? 'Kullanıcı'} />
            </AriaButton>
            <AriaPopover
              placement="left bottom"
              offset={8}
              crossOffset={6}
              className={({ isEntering, isExiting }) =>
                cx(
                  'will-change-transform',
                  isEntering &&
                    'duration-300 ease-out animate-in fade-in placement-right:slide-in-from-left-2 placement-top:slide-in-from-bottom-2 placement-bottom:slide-in-from-top-2',
                  isExiting &&
                    'duration-150 ease-in animate-out fade-out placement-right:slide-out-to-left-2 placement-top:slide-out-to-bottom-2 placement-bottom:slide-out-to-top-2'
                )
              }
            >
              <AriaDialog className="w-64 rounded-2xl border border-black/8 bg-white p-2 text-zinc-900 shadow-xl outline-none dark:border-white/[0.08] dark:bg-[#141414] dark:text-zinc-100">
                <div className="px-1 py-1.5">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{account?.name ?? 'Kullanıcı'}</span>
                      <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{account?.email ?? ''}</span>
                    </div>
                  </div>
                </div>

                <div className="-mx-1 my-1 h-px bg-black/10 dark:bg-white/[0.08]" />

                <div className="space-y-0.5">
                  <Link
                    to="/account"
                    className="flex w-full items-center rounded-xl p-2 text-sm text-zinc-700 transition-colors hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                  >
                    <User size={16} className="mr-2" />
                    Account
                  </Link>
                  <Link
                    to="/billing"
                    className="flex w-full items-center rounded-xl p-2 text-sm text-zinc-700 transition-colors hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                  >
                    <CreditCard size={16} className="mr-2" />
                    Billing
                  </Link>
                  {account?.onLogout && (
                    <button
                      type="button"
                      onClick={account.onLogout}
                      className="flex w-full items-center rounded-xl p-2 text-sm text-zinc-700 transition-colors hover:bg-black/[0.04] cursor-pointer dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                    >
                      <LogOut size={16} className="mr-2" />
                      Log out
                    </button>
                  )}
                </div>

                <div className="-mx-1 my-1 h-px bg-black/10 dark:bg-white/[0.08]" />

                <Link
                  to="/changelog"
                  className="flex w-full items-center rounded-xl p-2 text-sm text-zinc-700 transition-colors hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                >
                  <List size={16} className="mr-2" />
                  Changelog
                </Link>

                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Theme</span>
                  <div className="flex items-center gap-1 rounded-md bg-zinc-100 p-0.5 dark:bg-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={cx(
                        'rounded p-1.5 transition-colors cursor-pointer',
                        !isDark
                          ? 'bg-white shadow-sm text-zinc-900'
                          : 'text-zinc-400 hover:bg-white/50 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200'
                      )}
                      aria-label="Açık tema"
                    >
                      <Sun size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={cx(
                        'rounded p-1.5 transition-colors cursor-pointer',
                        isDark
                          ? 'bg-zinc-900 text-zinc-50 shadow-sm dark:bg-white dark:text-zinc-900'
                          : 'text-zinc-400 hover:bg-white/50 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200'
                      )}
                      aria-label="Koyu tema"
                    >
                      <Moon size={14} />
                    </button>
                  </div>
                </div>

                <div className="-mx-1 my-1 h-px bg-black/10 dark:bg-white/[0.08]" />

                <ul className="mt-2 flex gap-2 px-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <li>
                    <a href="https://fashn.ai/terms-of-use" target="_blank" rel="noreferrer">
                      Terms of Use
                    </a>
                  </li>
                  <li>&middot;</li>
                  <li>
                    <a href="https://fashn.ai/privacy-policy" target="_blank" rel="noreferrer">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </AriaDialog>
            </AriaPopover>
          </AriaDialogTrigger>
        </div>
      </div>
    </aside>
  )

  const secondarySidebar = currentItem && (
    <AnimatePresence initial={false}>
      {isSecondarySidebarVisible && (
        <motion.div
          initial={{ width: 0, borderColor: 'var(--color-border-secondary)' }}
          animate={{ width: SECONDARY_SIDEBAR_WIDTH, borderColor: 'var(--color-border-secondary)' }}
          exit={{
            width: 0,
            borderColor: 'rgba(0,0,0,0)',
            transition: { borderColor: { type: 'tween', delay: 0.05 } },
          }}
          transition={{ type: 'spring', damping: 26, stiffness: 220, bounce: 0 }}
          className={cx(
            'relative h-full overflow-x-hidden overflow-y-auto bg-white dark:bg-[#141414]',
            !(hideBorder || hideRightBorder) && 'box-content border-l-[1.5px] border-black/[0.08] dark:border-white/[0.08]'
          )}
        >
          <div style={{ width: SECONDARY_SIDEBAR_WIDTH }} className="flex h-full flex-col px-4 pt-6">
            <h3 className="text-sm font-semibold text-[#7a6b58] dark:text-[#e8dcc8]">{currentItem.label}</h3>
            <ul className="py-2">
              {currentItem.items?.map((item) => (
                <li key={item.label} className="py-px">
                  <NavItemBase
                    current={activeUrl === item.href || activeUrl.startsWith(item.href)}
                    href={item.href}
                    icon={item.icon}
                    badge={item.badge}
                    type="link"
                  >
                    {item.label}
                  </NavItemBase>
                </li>
              ))}
            </ul>
            {account && (
              <div className="sticky bottom-0 mt-auto flex justify-between bg-white pb-5 dark:bg-[#141414]">
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-zinc-100">{account.name}</p>
                  <p className="text-sm text-muted dark:text-zinc-400">{account.email}</p>
                </div>
                {account.onLogout && (
                  <div className="absolute -top-1 right-0">
                    <ButtonUtility
                      size="xs"
                      color="tertiary"
                      tooltip="Çıkış"
                      icon={DotsVertical}
                      onClick={account.onLogout}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const mobileFooter = footerItems.length > 0 ? footerItems : defaultFooterItems

  return (
    <div className="studio-sidebar-ui">
      <div
        className="z-50 hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex flex-row"
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {secondarySidebar}
        {mainSidebar}
      </div>

      <div
        style={{ paddingRight: MAIN_SIDEBAR_WIDTH }}
        className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:right-0 lg:block"
        aria-hidden
      />

      <MobileNavigationHeader>
        <aside className="group flex h-full max-h-full w-full max-w-full flex-col justify-between overflow-y-auto bg-white pt-4 dark:bg-[#141414]">
          <div className="px-4">
            <Link to="/fashion">
              <UntitledLogo className="h-6" />
            </Link>
          </div>

          <NavList items={items} />

          <div className="mt-auto flex flex-col gap-3 p-4">
            <div className="flex flex-col">
              {mobileFooter.map((item) => (
                <NavItemBase
                  key={item.label}
                  current={activeUrl === item.href}
                  type="link"
                  href={item.href}
                  icon={item.icon}
                >
                  {item.label}
                </NavItemBase>
              ))}
            </div>
            {account && (
              <div className="rounded-xl bg-white p-3 ring-1 ring-[rgba(0,0,0,0.08)] ring-inset dark:bg-[#141414] dark:ring-white/[0.08]">
                <p className="text-sm font-semibold text-ink dark:text-zinc-100">{account.name}</p>
                <p className="text-sm text-muted dark:text-zinc-400">{account.email}</p>
                {account.onLogout && (
                  <button
                    type="button"
                    onClick={account.onLogout}
                    className="mt-3 flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary_hover cursor-pointer dark:text-zinc-300 dark:hover:text-zinc-50"
                  >
                    <LogOut01 className="size-4" />
                    Çıkış Yap
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      </MobileNavigationHeader>
    </div>
  )
}

const defaultFooterItems: NavItemWithIcon[] = [
  { label: 'Destek', href: '/', icon: LifeBuoy01 },
  { label: 'Ayarlar', href: '/fashion', icon: Settings01 },
]
