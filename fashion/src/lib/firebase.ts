import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const OAUTH_RETURN_KEY = 'nuladesign-oauth-return'
const ID_TOKEN_BACKUP_KEY = 'nuladesign-firebase-idtoken'

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId)
}

let cachedApp: FirebaseApp | null = null
let cachedAuth: Auth | null = null
let redirectResultPromise: Promise<{ idToken: string; user: User } | null> | null = null

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null
  if (cachedAuth) return cachedAuth
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  cachedAuth = getAuth(cachedApp)
  return cachedAuth
}

function googleProvider() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  provider.addScope('email')
  provider.addScope('profile')
  return provider
}

async function tokenFromUser(user: User) {
  const idToken = await user.getIdToken(true)
  if (!idToken) throw new Error('Firebase oturum belirteci alınamadı.')
  sessionStorage.setItem(ID_TOKEN_BACKUP_KEY, idToken)
  return { idToken, user }
}

/** Popup → başarısızsa redirect. Firebase kendi OAuth client'ını kullanır (GIS invalid_client olmaz). */
export async function signInWithGoogleFirebase(): Promise<{ idToken: string; user: User }> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase yapılandırılmadı.')

  try {
    const result = await signInWithPopup(auth, googleProvider())
    return tokenFromUser(result.user)
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw e
    }
    if (code === 'auth/popup-blocked') {
      sessionStorage.setItem(OAUTH_RETURN_KEY, `${window.location.pathname}${window.location.search}`)
      redirectResultPromise = null
      sessionStorage.removeItem(ID_TOKEN_BACKUP_KEY)
      await signInWithRedirect(auth, googleProvider())
      const err = new Error('Yönlendiriliyor…') as Error & { code?: string }
      err.code = 'auth/redirecting'
      throw err
    }
    throw e
  }
}

export function completeGoogleFirebaseRedirect(): Promise<{ idToken: string; user: User } | null> {
  if (!redirectResultPromise) {
    redirectResultPromise = resolveGoogleFirebaseRedirect()
  }
  return redirectResultPromise
}

async function resolveGoogleFirebaseRedirect(): Promise<{ idToken: string; user: User } | null> {
  const auth = getFirebaseAuth()
  if (!auth) return null

  try {
    await auth.authStateReady()
    const result = await getRedirectResult(auth)
    if (result?.user) return tokenFromUser(result.user)
  } catch {
    /* StrictMode */
  }

  const backup = sessionStorage.getItem(ID_TOKEN_BACKUP_KEY)
  if (backup && auth.currentUser) {
    return { idToken: backup, user: auth.currentUser }
  }

  if (auth.currentUser) return tokenFromUser(auth.currentUser)

  return null
}

export function clearFirebaseAuthBackup() {
  sessionStorage.removeItem(ID_TOKEN_BACKUP_KEY)
}
