import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth, type User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId)
}

let cachedApp: FirebaseApp | null = null
let cachedAuth: Auth | null = null

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null
  if (cachedAuth) return cachedAuth
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  cachedAuth = getAuth(cachedApp)
  return cachedAuth
}

/** Firebase Google popup → backend `POST /api/auth/firebase` için idToken. */
export async function signInWithGoogleFirebase(): Promise<{ idToken: string; user: User }> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase yapılandırılmadı.')
  }

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  const result = await signInWithPopup(auth, provider)
  const idToken = await result.user.getIdToken(true)
  if (!idToken) {
    throw new Error('Firebase oturum belirteci alınamadı.')
  }
  return { idToken, user: result.user }
}
