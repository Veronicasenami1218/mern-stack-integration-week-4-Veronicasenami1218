import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (roles && roles.length > 0) {
    const role = user?.role
    if (!role || !roles.includes(role)) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />
    }
  }
  return children
}
