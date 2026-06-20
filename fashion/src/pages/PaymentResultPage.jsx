import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '@/lib/api'

export default function PaymentResultPage({ ok }) {
  const { user, setCredits } = useAuth()

  useEffect(() => {
    if (!ok || !user?.email) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(apiUrl(`/api/users/by-email/${encodeURIComponent(user.email)}`))
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (data?.Credits != null && !cancelled) setCredits(data.Credits)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ok, user?.email, setCredits])

  return (
    <div className="pt-28 pb-16 max-w-lg mx-auto px-5 text-center">
      <h1 className="font-serif text-2xl text-ink dark:text-white mb-3">
        {ok ? 'Ödeme tamamlandı' : 'Ödeme tamamlanamadı'}
      </h1>
      <p className="text-sm text-muted mb-8">
        {ok
          ? 'Kredileriniz birkaç saniye içinde güncellenir. Sayfayı yenileyebilir veya stüdyoya geçebilirsiniz.'
          : 'İşlem iptal edildi veya banka onayı alınamadı. Sorun devam ederse destek ile iletişime geçin.'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/studio"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-5 py-2.5"
        >
          Stüdyoya git
        </Link>
        <Link
          to="/fiyatlandirma"
          className="inline-flex items-center justify-center rounded-xl border border-black/10 dark:border-white/15 text-sm px-5 py-2.5 text-ink dark:text-white"
        >
          Planlar
        </Link>
      </div>
    </div>
  )
}
