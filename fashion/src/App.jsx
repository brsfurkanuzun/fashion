import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import StudioPage from './pages/StudioPage'
import GalleryPage from './pages/GalleryPage'
import SupportPage from './pages/SupportPage'
import AccountPage from './pages/AccountPage'
import BillingPage from './pages/BillingPage'
import ChangelogPage from './pages/ChangelogPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentResultPage from './pages/PaymentResultPage'
import RegisterForPurchasePage from './pages/RegisterForPurchasePage'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import RefundPolicyPage from './pages/legal/RefundPolicyPage'
import ContactPage from './pages/legal/ContactPage'

function LegacyFashionRedirect() {
  const location = useLocation()
  return <Navigate to={`/studio${location.search}`} replace />
}

export default function App() {
  const [loginModal, setLoginModal] = useState({ open: false, mode: 'login' })
  const openLogin = (mode = 'login') => {
    setLoginModal({ open: true, mode: mode === 'register' ? 'register' : 'login' })
  }
  const closeLogin = () => setLoginModal({ open: false, mode: 'login' })

  return (
    <Routes>
      <Route
        element={
          <Layout
            loginOpen={loginModal.open}
            loginInitialMode={loginModal.mode}
            onOpenLogin={openLogin}
            onCloseLogin={closeLogin}
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="fiyatlandirma" element={<PricingPage />} />
        <Route path="kayit" element={<RegisterForPurchasePage />} />
        <Route path="odeme/basarili" element={<PaymentResultPage ok />} />
        <Route path="odeme/hata" element={<PaymentResultPage ok={false} />} />
        <Route
          path="odeme"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="studio"
          element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          }
        />
        <Route path="fashion" element={<LegacyFashionRedirect />} />
        <Route
          path="gallery"
          element={
            <ProtectedRoute>
              <GalleryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route path="changelog" element={<ChangelogPage />} />
        <Route path="kullanim-sartlari" element={<TermsPage />} />
        <Route path="gizlilik" element={<PrivacyPage />} />
        <Route path="iade-politikasi" element={<RefundPolicyPage />} />
        <Route path="iletisim" element={<ContactPage />} />
      </Route>
    </Routes>
  )
}
