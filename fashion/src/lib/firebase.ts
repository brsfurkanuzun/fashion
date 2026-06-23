import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
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
  return provider
}

export async function startGoogleFirebaseRedirect(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase yapılandırılmadı.')
  sessionStorage.removeItem(ID_TOKEN_BACKUP_KEY)
  redirectResultPromise = null
  await signInWithRedirect(auth, googleProvider())
}

/**
 * getRedirectResult yalnızca bir kez çalışır (React StrictMode güvenli).
 */
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
    const result = await getRedirectResult(auth)
    if (result?.user) {
      const idToken = await result.user.getIdToken(true)
      if (idToken) {
        sessionStorage.setItem(ID_TOKEN_BACKUP_KEY, idToken)
        return { idToken, user: result.user }
      }
    }
  } catch {
    /* StrictMode veya tekrar çağrı */
  }

  const backup = sessionStorage.getItem(ID_TOKEN_BACKUP_KEY)
  if (backup) {
    return { idToken: backup, user: auth.currentUser! }
  }

  if (auth.currentUser) {
    const idToken = await auth.currentUser.getIdToken(true)
    if (idToken) {
      sessionStorage.setItem(ID_TOKEN_BACKUP_KEY, idToken)
      return { idToken, user: auth.currentUser }
    }
  }

  return null
}

export function clearFirebaseAuthBackup() {
  sessionStorage.removeItem(ID_TOKEN_BACKUP_KEY)
}
