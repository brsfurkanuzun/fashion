import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import StudioHeader from './StudioHeader'
import StudioSidebar from './StudioSidebar'
import Footer from './Footer'
import LoginModal from './LoginModal'
import { useAuth } from '../context/AuthContext'

export default function Layout({ loginOpen, loginInitialMode, onOpenLogin, onCloseLogin }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const studioPaths = ['/studio', '/gallery', '/support', '/account', '/billing']
  const isStudioLayout = studioPaths.includes(location.pathname) && isAuthenticated

  return (
    <div className="grain mesh-bg site-shell min-h-screen text-ink overflow-x-hidden transition-colors duration-300 flex flex-col">
      {isStudioLayout ? (
        <>
          <StudioSidebar />
          <StudioHeader />
        </>
      ) : (
        <Navbar onOpenLogin={onOpenLogin} />
      )}
      <main className={`flex-1 ${isStudioLayout ? 'lg:pr-[68px]' : ''}`}>
        <Outlet context={{ openLogin: onOpenLogin }} />
      </main>
      <Footer onOpenLogin={onOpenLogin} variant={isStudioLayout ? 'studio' : 'default'} />
      <LoginModal open={loginOpen} onClose={onCloseLogin} initialMode={loginInitialMode} />
    </div>
  )
}
