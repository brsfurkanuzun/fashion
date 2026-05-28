import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import FashionHeader from './FashionHeader'
import StudioSidebar from './StudioSidebar'
import Footer from './Footer'
import LoginModal from './LoginModal'
import { useAuth } from '../context/AuthContext'

export default function Layout({ loginOpen, onOpenLogin, onCloseLogin }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const studioPaths = ['/fashion', '/gallery', '/support', '/account', '/billing']
  const isFashionStudio = studioPaths.includes(location.pathname) && isAuthenticated

  return (
    <div className="grain mesh-bg site-shell min-h-screen text-ink overflow-x-hidden transition-colors duration-300">
      {isFashionStudio ? (
        <>
          <StudioSidebar />
          <FashionHeader />
        </>
      ) : (
        <Navbar onOpenLogin={onOpenLogin} />
      )}
      <main className={isFashionStudio ? 'lg:pr-[68px]' : ''}>
        <Outlet />
      </main>
      {!isFashionStudio && <Footer />}
      <LoginModal open={loginOpen} onClose={onCloseLogin} />
    </div>
  )
}
