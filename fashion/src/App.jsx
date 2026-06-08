import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import FashionPage from './pages/FashionPage'
import GalleryPage from './pages/GalleryPage'
import SupportPage from './pages/SupportPage'
import AccountPage from './pages/AccountPage'
import BillingPage from './pages/BillingPage'
import ChangelogPage from './pages/ChangelogPage'
export default function App() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <Routes>
      <Route
        element={
          <Layout
            loginOpen={loginOpen}
            onOpenLogin={() => setLoginOpen(true)}
            onCloseLogin={() => setLoginOpen(false)}
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="fiyatlandirma" element={<PricingPage />} />
        <Route
          path="fashion"
          element={
            <ProtectedRoute>
              <FashionPage />
            </ProtectedRoute>
          }
        />
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
      </Route>
    </Routes>
  )
}
