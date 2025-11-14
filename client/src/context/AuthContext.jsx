import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser())

  useEffect(() => {
    // Keep user in sync with localStorage changes (e.g., from other tabs)
    const handler = () => setUser(authService.getCurrentUser())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const login = async (email, password) => {
    const res = await authService.login({ email, password })
    setUser(res.user)
    return res
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
