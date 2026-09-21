import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'

type AuthContextValue = {
  user: RecordModel | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(pb.authStore.record)
    setIsLoading(false)

    return pb.authStore.onChange(() => {
      setUser(pb.authStore.record)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await pb.collection('users').authWithPassword(email, password)
  }, [])

  const logout = useCallback(() => {
    pb.authStore.clear()
  }, [])

  const refresh = useCallback(async () => {
    if (!pb.authStore.isValid) return
    try {
      await pb.collection('users').authRefresh()
    } catch {
      // session may have expired; leave store as-is until next protected call
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refresh,
    }),
    [user, isLoading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
