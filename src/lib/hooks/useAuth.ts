'use client'

import { useEffect, type ReactNode } from 'react'
import { getRedirectResult } from 'firebase/auth'
import { FirebaseClientAuthProvider } from '@/lib/auth/firebase-provider'
import { auth } from '@/lib/firebase/config'
import { userRepository } from '@/lib/repositories'
import { useAuthStore } from '@/lib/store/authStore'
import { CONFIG } from '@/lib/constants'
import { captureError } from '@/lib/monitoring/sentry'

const authProvider = new FirebaseClientAuthProvider()

const SESSION_COOKIE = '__session'
const SESSION_MAX_AGE = CONFIG.SESSION_COOKIE_MAX_AGE

function setSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`
}

function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export async function signInWithGoogle() {
  await authProvider.signInWithGoogle()
  // Set session cookie immediately so middleware sees auth on first redirect.
  setSessionCookie()
}

export async function signInWithEmail(email: string, password: string) {
  const err = await authProvider.signInWithEmail(email, password)
  if (!err) {
    // Set session cookie immediately so middleware sees auth on first redirect.
    setSessionCookie()
  }
  return err
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const err = await authProvider.signUpWithEmail(email, password, name)
  if (!err) {
    // Ensure onboarding route can pass middleware right after sign up.
    setSessionCookie()
  }
  return err
}

export function sendPasswordReset(email: string) {
  return authProvider.sendPasswordReset(email)
}

export function sendVerificationEmail() {
  return authProvider.sendVerificationEmail()
}

export async function reloadAuthUser(): Promise<boolean> {
  await auth.currentUser?.reload()
  return auth.currentUser?.emailVerified ?? false
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearUser, setLoading } = useAuthStore()

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        // User just returned from Google redirect — ensure the session cookie is set
        // immediately so any middleware-guarded navigation that follows sees it.
        setSessionCookie()
      }
    }).catch((error) => {
      console.error('Redirect sign-in error:', error)
    })

    let cancelPrevious: (() => void) | undefined

    const unsub = authProvider.onAuthStateChange((authUser) => {
      if (cancelPrevious) cancelPrevious()

      let cancelled = false
      cancelPrevious = () => { cancelled = true }

      setLoading(true)

      const handleAuthChange = async () => {
        if (!authUser) {
          if (!cancelled) {
            clearUser()
            clearSessionCookie()
          }
          return
        }

        try {
          let user = await userRepository.getById(authUser.id)
          if (cancelled) return

          if (!user) {
            user = await userRepository.createFromAuthUser({
              id: authUser.id,
              displayName: authUser.displayName,
              email: authUser.email,
              avatarUrl: authUser.avatarUrl,
            })
            if (cancelled) return
          }

          setUser(user, authUser)
          setSessionCookie()
        } catch (err) {
          captureError(err, { route: 'useAuth' })
          if (!cancelled) {
            clearUser()
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      }

      handleAuthChange()
    })

    return () => {
      if (cancelPrevious) cancelPrevious()
      unsub()
    }
  }, [setUser, clearUser, setLoading])

  return children as React.ReactElement
}

export function useAuth() {
  const { user, authUser, isLoading, isInitialized } = useAuthStore()
  return { user, authUser, isLoading, isInitialized, isAuthenticated: !!user }
}

export async function logout() {
  try {
    await authProvider.signOut()
    useAuthStore.getState().clearUser()
    clearSessionCookie()
  } catch (err) {
    console.error('[logout] Sign-out failed:', err)
  }
}
