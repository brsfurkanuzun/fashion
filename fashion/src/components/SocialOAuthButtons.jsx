import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'

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
  } catch (e) {
    throw new Error(e?.message || 'Sunucuya bağlanılamadı.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Giriş başarısız (${res.status}).`)
  }
  return data
}

/** Google GIS → POST /api/auth/google → DB kayıt */
export default function SocialOAuthButtons({ onSuccess, onStart, disabled, layout = 'modal', intent = 'login' }) {
  const googleDivRef = useRef(null)
  const [cfg, setCfg] = useState({ googleClientId: null, appleServicesId: null, configLoaded: false })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  const envGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || null
  const googleClientId = cfg.googleClientId || envGoogleClientId

  useEffect(() => {
    let cancelled = false
    apiFetch('/api/auth/client-config')
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) {
          throw new Error(data.message || `API ${r.status}`)
        }
        return data
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
      .catch((e) => {
        if (!cancelled) {
          setCfg((c) => ({ ...c, configLoaded: true }))
          setError(e?.message || 'API yapılandırması alınamadı.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

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

  useEffect(() => {
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
        setError('Google butonu yüklenemedi.')
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [googleClientId, layout, completeAuth, intent])

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

  if (!cfg.configLoaded) {
    return <p className="text-xs text-muted">Yükleniyor…</p>
  }

  if (!googleClientId && !cfg.appleServicesId) {
    return (
      <p className="text-xs text-muted leading-relaxed rounded-lg border border-faint bg-elevated/50 px-3 py-2.5">
        Google ClientId alınamadı. Railway&apos;de <span className="font-mono text-[11px]">Auth__Google__ClientId</span> tanımlı olmalı.
      </p>
    )
  }

  const gridCols = googleClientId && cfg.appleServicesId ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className={`grid gap-3 ${gridCols}`}>
        {googleClientId && (
          <div
            ref={googleDivRef}
            className="flex min-h-[44px] items-center justify-center [&>iframe]:max-w-full"
          />
        )}
        {cfg.appleServicesId && (
          <button
            type="button"
            disabled={dim}
            onClick={handleApple}
            className="auth-social-btn cursor-pointer inline-flex items-center justify-center gap-2 w-full"
          >
            <AppleGlyph />
            Apple
          </button>
        )}
      </div>
    </div>
  )
}
