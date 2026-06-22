import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'
import { SITE_NAME } from '@/lib/brand'
import SocialOAuthButtons from './SocialOAuthButtons'

const MODES = {
  login: {
    title: 'Tekrar hoş geldiniz',
    subtitle: 'Hesabınıza giriş yapın ve kampanyalarınıza devam edin.',
    cta: 'Giriş Yap',
    switch: 'Hesabınız yok mu?',
    switchAction: 'Kayıt olun',
  },
  register: {
    title: 'Hesap oluşturun',
    subtitle: 'Ücretsiz başlayın — stüdyo kalitesinde görseller saniyeler içinde.',
    cta: 'Hesap Oluştur',
    switch: 'Zaten hesabınız var mı?',
    switchAction: 'Giriş yapın',
  },
  forgot: {
    title: 'Şifrenizi sıfırlayın',
    subtitle: 'E-posta adresinize sıfırlama bağlantısı göndereceğiz.',
    cta: 'Bağlantı Gönder',
    switch: 'Giriş ekranına dön',
    switchAction: 'Giriş yap',
  },
}

export default function LoginModal({ open, onClose, initialMode = 'login' }) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const panelRef = useRef(null)
  const firstInputRef = useRef(null)

  const copy = MODES[mode]

  useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstInputRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, mode])

  useEffect(() => {
    if (!open) {
      setMode('login')
      setShowPassword(false)
      setLoading(false)
      setSuccess(false)
      setErrors({})
      setForm({ email: '', password: '', name: '' })
      return
    }
    setMode(initialMode === 'register' ? 'register' : 'login')
  }, [open, initialMode])

  const switchMode = (next) => {
    setMode(next)
    setErrors({})
    setSuccess(false)
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) {
      next.email = 'E-posta veya kullanıcı adı gerekli'
    } else if (
      mode !== 'login' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      next.email = 'Geçerli bir e-posta girin'
    }
    if (mode !== 'forgot' && !form.password) {
      next.password = 'Şifre gerekli'
    } else if (mode === 'register' && form.password.length < 8) {
      next.password = 'En az 8 karakter olmalı'
    }
    if (mode === 'register' && !form.name.trim()) {
      next.name = 'Ad soyad gerekli'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 450))

    if (mode === 'forgot') {
      setLoading(false)
      setSuccess(true)
      return
    }

    if (mode === 'register') {
      try {
        const registerResponse = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim(),
            name: form.name.trim(),
            password: form.password,
          }),
        })

        if (!registerResponse.ok) {
          const payload = await registerResponse.json().catch(() => ({}))
          setLoading(false)
          setErrors({
            general: payload.message || 'Kayıt oluşturulamadı.',
          })
          return
        }
      } catch {
        setLoading(false)
        setErrors({
          general: 'Backend bağlantısı kurulamadı.',
        })
        return
      }
    }

    try {
      const loginResponse = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: form.email.trim(),
          password: form.password,
        }),
      })

      const payload = await loginResponse.json().catch(() => ({}))
      if (!loginResponse.ok) {
        setLoading(false)
        setErrors({
          general: payload.message || 'Giriş başarısız.',
        })
        return
      }

      await login({
        id: payload.id,
        email: payload.email,
        name: payload.displayName || form.email.split('@')[0] || 'user',
        role: payload.role,
        credits: payload.credits,
      })
    } catch {
      setLoading(false)
      setErrors({
        general: 'Backend bağlantısı kurulamadı.',
      })
      return
    }

    setLoading(false)
    onClose()
    navigate('/studio')
  }

  const handleOAuthSuccess = async (payload) => {
    await login({
      id: payload.id,
      email: payload.email,
      name: payload.displayName || payload.email?.split('@')[0] || 'user',
      role: payload.role,
      credits: payload.credits ?? 0,
    })
    setLoading(false)
    onClose()
    navigate('/studio')
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-label="Kapat"
      />

      <div
        ref={panelRef}
        className="modal-panel relative w-full max-w-[920px] max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-subtle shadow-2xl shadow-black/20 dark:shadow-black/60 grid lg:grid-cols-[1fr_1.1fr] bg-elevated"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-muted hover:text-ink hover:bg-[var(--card-bg-hover)] transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-champagne focus-visible:outline-offset-2"
          aria-label="Kapat"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Sol panel — marka */}
        <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden bg-surface">
          <div className="absolute inset-0 mesh-bg opacity-80" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-champagne/5 blur-3xl" />

          <div className="relative">
            <span className="font-serif text-2xl tracking-tight">{SITE_NAME}</span>
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-xs glass-card px-3 py-1.5 rounded-full text-champagne-dim mb-6">
              <Sparkles size={12} />
              AI Moda Stüdyosu
            </span>
            <p className="font-serif text-3xl leading-snug tracking-tight">
              Tek fotoğraf.
              <br />
              <em className="text-champagne not-italic">Sınırsız kampanya.</em>
            </p>
            <p className="mt-4 text-sm text-muted font-light leading-relaxed max-w-xs">
              Binlerce marka stüdyo kalitesinde görselleri saniyeler içinde üretiyor.
            </p>
          </div>

          <p className="relative text-xs text-subtle">© {SITE_NAME}</p>
        </div>

        {/* Sağ panel — form */}
        <div className="relative bg-elevated p-6 sm:p-10 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center min-h-[380px] text-center py-8">
              <span className="w-14 h-14 rounded-full border border-champagne/30 bg-champagne/10 flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-champagne" />
              </span>
              <h2 id="auth-title" className="font-serif text-2xl sm:text-3xl tracking-tight">
                {mode === 'forgot' ? 'Bağlantı gönderildi' : mode === 'register' ? 'Hoş geldiniz!' : 'Giriş başarılı'}
              </h2>
              <p className="mt-3 text-sm text-muted font-light max-w-xs">
                E-posta adresinize şifre sıfırlama bağlantısı gönderildi.
              </p>
              <button type="button" onClick={onClose} className="btn-primary mt-8 cursor-pointer">
                Tamam
              </button>
            </div>
          ) : (
            <>
              <div className="lg:hidden mb-8">
                <span className="font-serif text-xl">{SITE_NAME}</span>
              </div>

              <h2 id="auth-title" className="font-serif text-2xl sm:text-3xl tracking-tight pr-8">
                {copy.title}
              </h2>
              <p className="mt-2 text-sm text-muted font-light">{copy.subtitle}</p>

              {errors.general && (
                <p className="mt-4 text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                  {errors.general}
                </p>
              )}

              {mode !== 'forgot' && (
                <>
                  <div className="mt-6">
                    <SocialOAuthButtons
                      layout="modal"
                      disabled={loading}
                      onSuccess={handleOAuthSuccess}
                    />
                  </div>
                  <div className="auth-divider my-6">
                    <span>veya e-posta ile</span>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {mode === 'register' && (
                  <div>
                    <label htmlFor="auth-name" className="auth-label">
                      Ad Soyad
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`auth-input ${errors.name ? 'auth-input-error' : ''}`}
                      placeholder="Ayşe Yılmaz"
                    />
                    {errors.name && <p className="auth-error">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="auth-label">
                    {mode === 'login' ? 'E-posta veya kullanıcı adı' : 'E-posta'}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" strokeWidth={1.5} />
                    <input
                      ref={firstInputRef}
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`auth-input !pl-11 ${errors.email ? 'auth-input-error' : ''}`}
                      placeholder={mode === 'login' ? 'admin' : 'ornek@marka.com'}
                    />
                  </div>
                  {errors.email && <p className="auth-error">{errors.email}</p>}
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="auth-password" className="auth-label !mb-0">
                        Şifre
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-champagne-dim hover:text-champagne transition-colors cursor-pointer"
                        >
                          Şifremi unuttum
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className={`auth-input !pl-11 !pr-11 ${errors.password ? 'auth-input-error' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-ink transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      >
                        {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {errors.password && <p className="auth-error">{errors.password}</p>}
                  </div>
                )}

                {mode === 'login' && (
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="auth-checkbox cursor-pointer"
                    />
                    <span className="text-sm text-muted group-hover:text-ink transition-colors">
                      Beni hatırla
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="auth-spinner" aria-hidden="true" />
                  ) : (
                    <>
                      {copy.cta}
                      <ArrowRight size={16} strokeWidth={1.75} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-muted">
                {copy.switch}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : mode === 'register' ? 'login' : 'login')}
                  className="text-champagne hover:underline cursor-pointer transition-colors"
                >
                  {copy.switchAction}
                </button>
              </p>

              {mode === 'register' && (
                <p className="mt-4 text-center text-[0.7rem] text-subtle leading-relaxed">
                  Kayıt olarak{' '}
                  <a href="#" className="text-muted hover:text-ink underline-offset-2 hover:underline cursor-pointer">
                    Kullanım Şartları
                  </a>{' '}
                  ve{' '}
                  <a href="#" className="text-muted hover:text-ink underline-offset-2 hover:underline cursor-pointer">
                    Gizlilik Politikası
                  </a>
                  &apos;nı kabul etmiş olursunuz.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
