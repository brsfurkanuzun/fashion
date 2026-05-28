import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim'
import { buildStudioNavItems } from '@/data/studioNavItems'

export default function StudioSidebar() {
  const { user, credits, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = useMemo(() => buildStudioNavItems(credits), [credits])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <SidebarNavigationSlim
      items={navItems}
      footerItems={[]}
      account={{
        name: user?.name ?? 'Kullanıcı',
        email: user?.email ?? '',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
        onLogout: handleLogout,
      }}
    />
  )
}
