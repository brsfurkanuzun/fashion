import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'
import { TrustInfoCard } from '@/components/compliance/CreditsComplianceSection'

function mountIyzicoForm(container, html) {
  if (!container || !html) return
  container.innerHTML = html
  container.querySelectorAll('script').forEach((oldScript) => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value)
    })
    newScript.appendChild(document.createTextNode(oldScript.innerHTML))
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
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
  const [identityNumber, setIdentityNumber] = useState('')
  const [checkoutFormContent, setCheckoutFormContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [creditsAcknowledged, setCreditsAcknowledged] = useState(false)
  const formContainerRef = useRef(null)

  useEffect(() => {
    if (!checkoutFormContent || !formContainerRef.current) return
    mountIyzicoForm(formContainerRef.current, checkoutFormContent)
  }, [checkoutFormContent])

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
      const res = await fetch(apiUrl('/api/payments/iyzico/initialize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          packageKey,
          phone: phone.trim(),
          address: address.trim(),
          identityNumber: identityNumber.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const parts = [
          data.message,
          data.baseUrl ? `BaseUrl: ${data.baseUrl}` : null,
          data.keyHint ? `Key: ${data.keyHint}` : null,
          data.hint,
        ].filter(Boolean)
        setError(parts.join(' · ') || `Ödeme oturumu başlatılamadı (${res.status}).`)
        setLoading(false)
        return
      }
      if (data.paymentPageUrl && !data.checkoutFormContent) {
        window.location.href = data.paymentPageUrl
        return
      }
      if (!data.checkoutFormContent) {
        setError('iyzico ödeme formu dönmedi.')
        setLoading(false)
        return
      }
      setCheckoutFormContent(data.checkoutFormContent)
    } catch {
      setError('Sunucuya bağlanılamadı.')
    } finally {
      setLoading(false)
    }
  }, [user?.id, packageKey, phone, address, identityNumber, creditsAcknowledged])

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

      {!checkoutFormContent && (
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
          <div>
            <label className="block text-xs font-medium text-muted mb-1">T.C. kimlik no (opsiyonel)</label>
            <input
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              placeholder="11 haneli TCKN"
              inputMode="numeric"
              maxLength={11}
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
            {loading ? 'Bağlanıyor…' : 'iyzico ile ödemeye geç'}
          </button>
          <p className="text-[11px] text-muted leading-relaxed">
            Kart bilgileri iyzico güvenli ödeme sayfasında girilir. Ödeme onayı sunucuya bildirim ile düşer.
          </p>
        </div>
      )}

      {checkoutFormContent && (
        <div className="mt-4">
          <div ref={formContainerRef} className="iyzico-checkout-form w-full min-h-[480px]" />
        </div>
      )}
    </div>
  )
}
