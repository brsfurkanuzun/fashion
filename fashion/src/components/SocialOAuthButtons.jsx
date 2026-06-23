import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { isFirebaseConfigured, signInWithGoogleFirebase } from '@/lib/firebase'

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function AppleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

function loadAppleScript() {
  return new Promise((resolve, reject) => {
    if (window.AppleID?.auth) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function postAuth(path, body) {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || data.title || `Giriş başarısız (${res.status}).`
    throw new Error(msg)
  }
  return data
}

/** Firebase Google → POST /api/auth/firebase → DB */
export default function SocialOAuthButtons({ onSuccess, onStart, disabled, layout = 'modal', intent = 'login' }) {
  const firebaseOn = isFirebaseConfigured()
  const [appleId, setAppleId] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    apiFetch('/api/auth/client-config')
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(d.message || `API ${r.status}`)
        return d
      })
      .then((d) => setAppleId(d.appleServicesId ?? null))
      .catch((e) => setError(e?.message || 'API bağlantı hatası.'))
      .finally(() => setReady(true))
  }, [])

  const handleGoogle = useCallback(async () => {
    if (disabled || busy) return
    setBusy(true)
    setError('')
    onStart?.()
    try {
      const { idToken } = await signInWithGoogleFirebase()
      const data = await postAuth('/api/auth/firebase', { idToken })
      onSuccess(data)
    } catch (e) {
      const code = e?.code
      if (code === 'auth/redirecting') return
      if (code === 'auth/unauthorized-domain') {
        setError('Firebase: design.nulatechnology.com ve localhost Authorized domains\'e eklenmeli.')
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(e?.message || 'Google girişi başarısız.')
      }
    } finally {
      setBusy(false)
    }
  }, [busy, disabled, onStart, onSuccess])

  const handleApple = async () => {
    if (!appleId) return
    setBusy(true)
    setError('')
    onStart?.()
    try {
      await loadAppleScript()
      window.AppleID.auth.init({
        clientId: appleId,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      })
      const res = await window.AppleID.auth.signIn()
      const token = res?.authorization?.id_token
      if (!token) throw new Error('Apple oturumu alınamadı.')
      const u = res?.user
      const data = await postAuth('/api/auth/apple', {
        identityToken: token,
        firstName: u?.name?.firstName,
        lastName: u?.name?.lastName,
        email: u?.email,
      })
      onSuccess(data)
    } catch (e) {
      if (e?.error !== 'popup_closed_by_user') {
        setError(e?.message || 'Apple girişi başarısız.')
      }
    } finally {
      setBusy(false)
    }
  }

  const btnClass =
    layout === 'modal'
      ? 'auth-social-btn cursor-pointer inline-flex items-center justify-center gap-2 w-full'
      : 'w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer text-ink dark:text-white disabled:opacity-50'

  const googleLabel = intent === 'register' ? 'Google ile kaydol' : 'Google ile devam et'
  const dim = disabled || busy

  if (!ready) return <p className="text-xs text-muted">Yükleniyor…</p>

  if (!firebaseOn && !appleId) {
    return (
      <p className="text-xs text-muted rounded-lg border border-faint bg-elevated/50 px-3 py-2.5">
        Firebase için <span className="font-mono text-[11px]">VITE_FIREBASE_*</span> .env dosyasına ekleyin.
      </p>
    )
  }

  const cols = firebaseOn && appleId ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className={`grid gap-3 ${cols}`}>
        {firebaseOn && (
          <button type="button" disabled={dim} onClick={handleGoogle} className={btnClass}>
            <GoogleGlyph />
            {googleLabel}
          </button>
        )}
        {appleId && (
          <button type="button" disabled={dim} onClick={handleApple} className={btnClass}>
            <AppleGlyph />
            Apple
          </button>
        )}
      </div>
    </div>
  )
}
