import { createContext, useContext, useEffect, useState } from 'react'
import { normalizeAuthResponse } from '@/lib/auth'

const STORAGE_KEY = 'nuladesign-auth'

const AuthContext = createContext(null)

export function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = (data) => {
    const next =
      data?.id != null && data?.email != null
        ? {
            id: String(data.id),
            email: String(data.email),
            name: String(data.name ?? data.email.split('@')[0] ?? 'user'),
            role: data.role || 'user',
            credits: data.credits ?? 0,
            profilePhotoUrl: data.profilePhotoUrl ?? null,
          }
        : normalizeAuthResponse(data)

    if (!next.id) {
      return { ok: false, message: 'Geçersiz oturum yanıtı.' }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return { ok: true }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const setCredits = (credits) => {
    setUser((prev) => (prev ? { ...prev, credits } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        credits: user?.credits ?? 0,
        isAuthenticated: Boolean(user?.id),
        login,
        logout,
        setCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
