import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
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
    navigate('/fashion')
  }

  const handleSocial = (provider) => {
    setSuccess(false)
    setErrors({ general: `${provider} ile giriş yakında aktif olacak.` })
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
            <span className="font-serif text-2xl tracking-tight">nuladesign</span>
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

          <p className="relative text-xs text-subtle">© nuladesign</p>
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
                <span className="font-serif text-xl">nuladesign</span>
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
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocial('Google')}
                    className="auth-social-btn cursor-pointer"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocial('Apple')}
                    className="auth-social-btn cursor-pointer"
                  >
                    <AppleIcon />
                    Apple
                  </button>
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="auth-divider my-6">
                  <span>veya e-posta ile</span>
                </div>
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
