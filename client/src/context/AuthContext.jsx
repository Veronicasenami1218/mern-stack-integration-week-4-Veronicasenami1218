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

  const getRoleMap = () => {
    try {
      return JSON.parse(localStorage.getItem('roleMap') || '{}')
    } catch {
      return {}
    }
  }

  const saveRoleForEmail = (email, role) => {
    const map = getRoleMap()
    map[email] = role
    localStorage.setItem('roleMap', JSON.stringify(map))
  }

  const attachRole = (u) => {
    if (!u) return u
    const map = getRoleMap()
    const role = map[u.email]
    return role ? { ...u, role } : u
  }

  // Ensure role is attached on initial load
  useEffect(() => {
    const current = authService.getCurrentUser()
    if (current) setUser(attachRole(current))
  }, [])

  const login = async (email, password) => {
    const res = await authService.login({ email, password })
    setUser(attachRole(res.user))
    return res
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const setRole = (role) => {
    if (!user?.email) return
    saveRoleForEmail(user.email, role)
    setUser((prev) => (prev ? { ...prev, role } : prev))
  }

  const value = useMemo(() => ({ user, login, logout, setRole, attachRole, saveRoleForEmail }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
