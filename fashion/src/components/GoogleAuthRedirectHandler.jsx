import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { normalizeAuthResponse } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import {
  clearOAuthRedirectState,
  completeGoogleFirebaseRedirect,
  hasPendingOAuthRedirect,
  isFirebaseConfigured,
  OAUTH_RETURN_KEY,
  resetFirebaseAuthSession,
} from '@/lib/firebase'

export default function GoogleAuthRedirectHandler() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const startedRef = useRef(false)

  const dismiss = useCallback(async () => {
    await resetFirebaseAuthSession()
    setError('')
    setBusy(false)
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured() || startedRef.current) return undefined
    if (!hasPendingOAuthRedirect()) return undefined

    startedRef.current = true

    ;(async () => {
      try {
        const session = await completeGoogleFirebaseRedirect()
        if (!session?.idToken) {
          clearOAuthRedirectState()
          return
        }

        setBusy(true)
        const res = await apiFetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: session.idToken }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          await resetFirebaseAuthSession()
          setError(data.message || 'Google girişi başarısız.')
          return
        }

        const result = login(normalizeAuthResponse(data))
        if (!result.ok) {
          await resetFirebaseAuthSession()
          setError(result.message || 'Oturum kaydedilemedi.')
          return
        }

        const returnTo = sessionStorage.getItem(OAUTH_RETURN_KEY) || '/studio'
        clearOAuthRedirectState()
        navigate(returnTo, { replace: true })
      } catch {
        await resetFirebaseAuthSession()
        setError('Sunucuya bağlanılamadı.')
      } finally {
        setBusy(false)
      }
    })()
  }, [login, navigate])

  if (!busy && !error) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oauth-redirect-title"
      onClick={() => {
        if (error) dismiss()
      }}
    >
      <div
        className="relative rounded-xl bg-elevated px-6 py-5 text-sm text-ink max-w-sm text-center shadow-xl border border-faint"
        onClick={(e) => e.stopPropagation()}
      >
        {error && (
          <button
            type="button"
            onClick={() => dismiss()}
            className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Kapat"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
        <p id="oauth-redirect-title" className={error ? 'pr-6' : ''}>
          {error || 'Google girişi tamamlanıyor…'}
        </p>
        {error && (
          <button
            type="button"
            onClick={() => dismiss()}
            className="mt-4 w-full rounded-lg border border-faint px-4 py-2 text-xs font-medium text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Kapat
          </button>
        )}
      </div>
    </div>
  )
}
