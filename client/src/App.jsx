import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
// Auth pages temporarily disabled per requirement to show dashboard directly
// import Login from './pages/Login'
// import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProgressList from './pages/ProgressList'
import ProgressForm from './pages/ProgressForm'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>        
        <Route path="/" element={<Dashboard />} />
        <Route path="/progress" element={<ProgressList />} />
        <Route path="/progress/new" element={<ProgressForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
