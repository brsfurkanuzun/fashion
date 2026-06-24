import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'
import { TrustInfoCard } from '@/components/compliance/CreditsComplianceSection'

function loadPaytrResizer(onReady) {
  if (typeof window === 'undefined') return () => {}
  if (window.iFrameResize) {
    onReady()
    return () => {}
  }
  const script = document.createElement('script')
  script.src = 'https://www.paytr.com/js/iframeResizer.min.js'
  script.async = true
  script.onload = () => onReady()
  document.body.appendChild(script)
  return () => {
    try {
      document.body.removeChild(script)
    } catch {
      /* ignore */
    }
  }
}

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const packageKey = useMemo(() => {
    const p = (params.get('paket') || 'starter').trim().toLowerCase()
    return p || 'starter'
  }, [params])

  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [creditsAcknowledged, setCreditsAcknowledged] = useState(false)

  useEffect(() => {
    if (!token) return
    const cleanup = loadPaytrResizer(() => {
      try {
        window.iFrameResize?.({}, '#paytriframe')
      } catch {
        /* ignore */
      }
    })
    return cleanup
  }, [token])

  const startPayment = useCallback(async () => {
    setError('')
    if (!user?.id) {
      setError('Oturum bulunamadı.')
      return
    }
    if (phone.trim().length < 10 || address.trim().length < 5) {
      setError('Telefon (en az 10 karakter) ve adres (en az 5 karakter) gerekli.')
      return
    }
    if (!creditsAcknowledged) {
      setError('Devam etmek için kullanım hakkı onayını işaretleyin.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(apiUrl('/api/payments/paytr/token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          packageKey,
          phone: phone.trim(),
          address: address.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'Ödeme oturumu başlatılamadı.')
        setLoading(false)
        return
      }
      if (!data.token) {
        setError('PayTR token dönmedi.')
        setLoading(false)
        return
      }
      setToken(data.token)
    } catch {
      setError('Sunucuya bağlanılamadı.')
    } finally {
      setLoading(false)
    }
  }, [user?.id, packageKey, phone, address, creditsAcknowledged])

  return (
    <div className="pt-28 pb-16 max-w-lg mx-auto px-5">
      <h1 className="font-serif text-2xl text-ink dark:text-white mb-2">Ödeme</h1>
      <p className="text-sm text-muted mb-6">
        Paket: <span className="font-medium text-ink dark:text-white">{packageKey}</span>
        {' · '}
        <Link to="/fiyatlandirma" className="text-cyan-600 dark:text-cyan-400 underline-offset-2 hover:underline">
          Planlara dön
        </Link>
      </p>

      {!token && (
        <div className="glass-card rounded-2xl p-6 space-y-4 shadow-sm">
          <TrustInfoCard />

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Telefon</label>
            <input
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xx xxx xx xx"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Fatura / teslimat adresi</label>
            <textarea
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm min-h-[88px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adres satırları"
              autoComplete="street-address"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="auth-checkbox mt-0.5 shrink-0"
              checked={creditsAcknowledged}
              onChange={(e) => setCreditsAcknowledged(e.target.checked)}
            />
            <span className="text-xs text-muted leading-relaxed group-hover:text-ink transition-colors">
              AI Görsel Üretim Hizmeti Kullanım Hakkı satın aldığımı; bunun sanal para, jeton veya token olmadığını
              ve yalnızca platformdaki yapay zekâ görsel üretim hizmetlerinde kullanılabileceğini anlıyorum.
            </span>
          </label>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="button"
            onClick={startPayment}
            disabled={loading || !creditsAcknowledged}
            className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium py-2.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Bağlanıyor…' : 'PayTR ile ödemeye geç'}
          </button>
          <p className="text-[11px] text-muted leading-relaxed">
            Kart bilgileri PayTR güvenli sayfasında girilir. Ödeme onayı sunucuya bildirim ile düşer; bu sayfa sadece
            oturum açar.
          </p>
        </div>
      )}

      {token && (
        <div className="mt-4">
          <iframe
            title="PayTR Ödeme"
            src={`https://www.paytr.com/odeme/guvenli/${token}`}
            id="paytriframe"
            frameBorder="0"
            scrolling="no"
            style={{ width: '100%', minHeight: 480 }}
          />
        </div>
      )}
    </div>
  )
}
