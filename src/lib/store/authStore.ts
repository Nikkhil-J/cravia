import { create } from 'zustand'
import type { User } from '@/lib/types'
import type { AuthSessionUser } from '@/lib/auth/provider'

interface AuthState {
  user: User | null
  authUser: AuthSessionUser | null
  isLoading: boolean
  /** True once the first auth check has resolved. Never goes back to false. */
  isInitialized: boolean
  setUser: (user: User | null, authUser: AuthSessionUser | null) => void
  clearUser: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authUser: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user, authUser) => set({ user, authUser, isLoading: false, isInitialized: true }),
  clearUser: () => set({ user: null, authUser: null, isLoading: false, isInitialized: true }),
  setLoading: (isLoading) => set({ isLoading }),
}))
