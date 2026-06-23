import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { isFirebaseConfigured, OAUTH_RETURN_KEY, startGoogleFirebaseRedirect } from '@/lib/firebase'

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (src.includes('accounts.google.com') && window.google?.accounts?.id) {
      resolve()
      return
    }
    if (src.includes('appleid.cdn') && window.AppleID?.auth) {
      resolve()
      return
    }
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.getAttribute('data-loaded') === '1') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => {
      s.setAttribute('data-loaded', '1')
      resolve()
    }
    s.onerror = reject
    document.head.appendChild(s)
  })
}

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

async function postAuth(path, body) {
  let res
  try {
    res = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Sunucuya bağlanılamadı. Biraz bekleyip tekrar deneyin.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Giriş başarısız (${res.status}).`)
  }
  return data
}

/**
 * Google (GIS öncelikli, Firebase yedek) / Apple ile oturum.
 */
export default function SocialOAuthButtons({ onSuccess, onStart, disabled, layout = 'modal', intent = 'login' }) {
  const googleDivRef = useRef(null)
  const firebaseAvailable = isFirebaseConfigured()
  const [cfg, setCfg] = useState({ googleClientId: null, appleServicesId: null, configLoaded: false })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  const envGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || null
  // Firebase varsa öncelikli — GIS invalid_client (Authorized JavaScript origins) gerektirir
  const useFirebase = firebaseAvailable
  const googleClientId = cfg.googleClientId || envGoogleClientId
  const useGis = Boolean(googleClientId) && !useFirebase
  const googleEnabled = useFirebase || Boolean(googleClientId)

  useEffect(() => {
    let cancelled = false
    apiFetch('/api/auth/client-config')
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`)
        return r.json()
      })
      .then((d) => {
        if (!cancelled) {
          setCfg({
            googleClientId: d.googleClientId ?? null,
            appleServicesId: d.appleServicesId ?? null,
            configLoaded: true,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCfg((c) => ({ ...c, configLoaded: true }))
          if (!firebaseAvailable) {
            setError('API yapılandırması alınamadı. Backend bağlantısını kontrol edin.')
          }
        }
      })
    return () => {
      cancelled = true
    }
  }, [firebaseAvailable])

  const completeAuth = useCallback(async (path, body) => {
    setBusy(true)
    setError('')
    onStart?.()
    try {
      const data = await postAuth(path, body)
      onSuccessRef.current(data)
    } catch (e) {
      setError(e?.message || 'Giriş başarısız.')
    } finally {
      setBusy(false)
    }
  }, [onStart])

  const handleGoogleFirebase = () => {
    if (disabled || busy) return
    setError('')
    sessionStorage.setItem(OAUTH_RETURN_KEY, `${window.location.pathname}${window.location.search}`)
    startGoogleFirebaseRedirect().catch((e) => {
      setError(e?.message || 'Google girişi başarısız.')
    })
  }

  useEffect(() => {
    if (!useGis) return undefined

    const cid = googleClientId
    const el = googleDivRef.current
    if (!cid || !el) return undefined

    let cancelled = false
    let cleanup = () => {}

    ;(async () => {
      try {
        await loadScriptOnce('https://accounts.google.com/gsi/client')
        if (cancelled || !googleDivRef.current || !window.google?.accounts?.id) return
        const host = googleDivRef.current
        host.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: cid,
          callback: (resp) => {
            if (resp?.credential) completeAuth('/api/auth/google', { credential: resp.credential })
          },
          auto_select: false,
        })
        window.google.accounts.id.renderButton(host, {
          type: 'standard',
          theme: layout === 'modal' ? 'filled_black' : 'outline',
          size: 'large',
          text: intent === 'register' ? 'signup_with' : 'continue_with',
          shape: 'rectangular',
          locale: 'tr',
          width: Math.min(host.offsetWidth || 320, 400),
        })
        cleanup = () => {
          try {
            window.google?.accounts?.id?.cancel()
          } catch {
            /* ignore */
          }
          host.innerHTML = ''
        }
      } catch {
        setError('Google oturum bileşeni yüklenemedi.')
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [googleClientId, layout, completeAuth, intent, useGis])

  const handleApple = async () => {
    const sid = cfg.appleServicesId
    if (!sid) {
      setError('Apple ile giriş yapılandırılmamış.')
      return
    }
    setBusy(true)
    setError('')
    onStart?.()
    try {
      await loadScriptOnce('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
      if (!window.AppleID?.auth) {
        setError('Apple SDK yüklenemedi.')
        return
      }
      window.AppleID.auth.init({
        clientId: sid,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      })
      const res = await window.AppleID.auth.signIn()
      const token = res?.authorization?.id_token
      if (!token) {
        setError('Apple oturumu alınamadı.')
        return
      }
      const u = res?.user
      const data = await postAuth('/api/auth/apple', {
        identityToken: token,
        firstName: u?.name?.firstName,
        lastName: u?.name?.lastName,
        email: u?.email,
      })
      onSuccessRef.current(data)
    } catch (e) {
      if (e?.error !== 'popup_closed_by_user') {
        setError(e?.message || 'Apple girişi iptal edildi veya başarısız.')
      }
    } finally {
      setBusy(false)
    }
  }

  const dim = disabled || busy
  const btnClass =
    layout === 'modal'
      ? 'auth-social-btn cursor-pointer inline-flex items-center justify-center gap-2 w-full'
      : 'w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer text-ink dark:text-white disabled:opacity-50'

  const googleLabel = intent === 'register' ? 'Google ile kaydol' : 'Google ile devam et'

  if (cfg.configLoaded && !googleEnabled && !cfg.appleServicesId) {
    return (
      <p className="text-xs text-muted leading-relaxed rounded-lg border border-faint bg-elevated/50 px-3 py-2.5">
        Google ile giriş için API&apos;de <span className="font-mono text-[11px]">Auth:Google:ClientId</span> tanımlayın.
      </p>
    )
  }

  const gridCols = googleEnabled && cfg.appleServicesId ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className={`grid gap-3 ${gridCols}`}>
        {googleEnabled &&
          (useGis ? (
            <div
              ref={googleDivRef}
              className="flex min-h-[44px] items-center justify-center [&>iframe]:max-w-full"
            />
          ) : (
            <button type="button" disabled={dim} onClick={handleGoogleFirebase} className={btnClass}>
              <GoogleGlyph />
              {googleLabel}
            </button>
          ))}
        {cfg.appleServicesId && (
          <button type="button" disabled={dim} onClick={handleApple} className={btnClass}>
            <AppleGlyph />
            Apple
          </button>
        )}
      </div>
    </div>
  )
}
