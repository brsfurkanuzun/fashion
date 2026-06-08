import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'nuladesign-auth'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = async (data) => {
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      credits: data.credits ?? 0,
    })
    return { ok: true }
  }

  const logout = () => setUser(null)

  const setCredits = (credits) => {
    setUser((prev) => (prev ? { ...prev, credits } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        credits: user?.credits ?? 0,
        isAuthenticated: !!user,
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
