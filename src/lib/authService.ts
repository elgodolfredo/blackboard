import { auth } from './firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export async function loginWithGoogle(): Promise<void> {
  try {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  } catch (error: unknown) {
    const err = error as { code: string; message: string }
    throw new Error(getErrorMessage(err.code))
  }
}

export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Login cancelled'
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please enable popups for this site.'
    case 'auth/account-exists-with-different-credential':
      return 'Account already exists with different credentials'
    default:
      return 'Google sign-in failed'
  }
}
