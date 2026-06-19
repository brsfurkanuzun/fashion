import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'
import SocialOAuthButtons from '../components/SocialOAuthButtons'

function normalizePaket(raw) {
  const p = (raw || 'starter').trim().toLowerCase()
  if (p === 'starter') return 'starter'
  const m = /^pro-(\d+)$/.exec(p)
  if (!m) return 'starter'
  const n = Number(m[1])
  if (n >= 0 && n <= 6) return `pro-${n}`
  return 'starter'
}

export default function RegisterForPurchasePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()

  const paket = useMemo(() => normalizePaket(params.get('paket')), [params])

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    navigate(`/odeme?paket=${encodeURIComponent(paket)}`, { replace: true })
  }, [isAuthenticated, navigate, paket])

  const validate = useCallback(() => {
    const next = {}
    if (!form.name.trim()) next.name = 'Ad soyad gerekli'
    if (!form.email.trim()) {
      next.email = 'E-posta gerekli'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Geçerli bir e-posta girin'
    }
    if (!form.password) {
      next.password = 'Şifre gerekli'
    } else if (form.password.length < 8) {
      next.password = 'En az 8 karakter olmalı'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }, [form])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
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
        setErrors({ general: payload.message || 'Kayıt oluşturulamadı.' })
        setLoading(false)
        return
      }

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
        setErrors({ general: payload.message || 'Giriş başarısız.' })
        setLoading(false)
        return
      }

      await login({
        id: payload.id,
        email: payload.email,
        name: payload.displayName || form.email.split('@')[0] || 'user',
        role: payload.role,
        credits: payload.credits,
      })
      navigate(`/odeme?paket=${encodeURIComponent(paket)}`, { replace: true })
    } catch {
      setErrors({ general: 'Sunucuya bağlanılamadı.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-28 pb-20 min-h-screen px-5">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 mb-2">Satın alma</p>
        <h1 className="font-serif text-3xl text-ink dark:text-white mb-2">Hesap oluştur</h1>
        <p className="text-sm text-muted mb-8">
          Ödeme adımına geçmek için kayıt olun. Seçilen paket:{' '}
          <span className="font-medium text-ink dark:text-white">{paket}</span>
        </p>

        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <SocialOAuthButtons
              layout="inline"
              disabled={loading}
              onSuccess={async (payload) => {
                await login({
                  id: payload.id,
                  email: payload.email,
                  name: payload.displayName || payload.email?.split('@')[0] || 'user',
                  role: payload.role,
                  credits: payload.credits ?? 0,
                })
                navigate(`/odeme?paket=${encodeURIComponent(paket)}`, { replace: true })
              }}
            />
          </div>
          <div className="flex items-center gap-4 mb-6 text-muted">
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <span className="text-xs shrink-0">veya e-posta ile</span>
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-xs font-medium text-muted mb-1">
                Ad Soyad
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-3 py-2.5 text-sm"
                placeholder="Ayşe Yılmaz"
              />
              {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-muted mb-1">
                E-posta
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-3 py-2.5 text-sm"
                placeholder="ornek@posta.com"
              />
              {errors.email && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-muted mb-1">
                Şifre
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-3 py-2.5 text-sm"
                placeholder="En az 8 karakter"
              />
              {errors.password && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.password}</p>}
            </div>
            {errors.general && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium py-2.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Kaydediliyor…' : 'Kayıt ol ve ödemeye geç'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Zaten hesabın var mı?{' '}
            <Link to="/" className="text-cyan-600 dark:text-cyan-400 underline-offset-2 hover:underline font-medium">
              Ana sayfadan giriş yap
            </Link>
          </p>
          <p className="mt-3 text-center">
            <Link
              to="/fiyatlandirma"
              className="text-xs text-muted underline-offset-2 hover:underline"
            >
              Fiyatlandırmaya dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
