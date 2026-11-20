import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAccessToken } from '../lib/api'

const AuthContext = createContext(null)

const applySession = (setUser, data) => {
  setAccessToken(data.accessToken)
  setUser(data.user)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      try {
        const { data } = await api.post('/auth/refresh')
        if (!cancelled) applySession(setUser, data.data)
      } catch {
        if (!cancelled) {
          setAccessToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    applySession(setUser, data.data)
    return data.data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    applySession(setUser, data.data)
    return data.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  const refreshMe = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    setUser(data.data.user)
    return data.data.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
      setUser,
      isStaff: ['employee', 'manager', 'admin'].includes(user?.role),
      isManager: ['manager', 'admin'].includes(user?.role),
      isAdmin: user?.role === 'admin',
    }),
    [user, loading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
