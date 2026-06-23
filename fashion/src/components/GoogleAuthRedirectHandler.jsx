import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '@/lib/api'
import { normalizeAuthResponse } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import {
  clearFirebaseAuthBackup,
  completeGoogleFirebaseRedirect,
  isFirebaseConfigured,
  OAUTH_RETURN_KEY,
} from '@/lib/firebase'

export default function GoogleAuthRedirectHandler() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isFirebaseConfigured() || startedRef.current) return undefined
    startedRef.current = true

    ;(async () => {
      try {
        const session = await completeGoogleFirebaseRedirect()
        if (!session?.idToken) return

        setBusy(true)
        const res = await apiFetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: session.idToken }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.message || 'Google girişi başarısız.')
          return
        }

        const result = login(normalizeAuthResponse(data))
        if (!result.ok) {
          setError(result.message || 'Oturum kaydedilemedi.')
          return
        }

        clearFirebaseAuthBackup()
        const returnTo = sessionStorage.getItem(OAUTH_RETURN_KEY) || '/studio'
        sessionStorage.removeItem(OAUTH_RETURN_KEY)
        navigate(returnTo, { replace: true })
      } catch {
        setError('Sunucuya bağlanılamadı.')
      } finally {
        setBusy(false)
      }
    })()
  }, [login, navigate])

  if (!busy && !error) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-xl bg-elevated px-6 py-4 text-sm text-ink max-w-sm text-center">
        {error || 'Google girişi tamamlanıyor…'}
      </div>
    </div>
  )
}
