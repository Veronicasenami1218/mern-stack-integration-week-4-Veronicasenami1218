import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="app">
      <aside className="sidebar">
        <h1>
          <span role="img" aria-label="cap">🎓</span>
          Student Tracker
        </h1>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/progress">Progress</Link>
          <Link to="/progress/new">Add Progress</Link>
        </nav>
      </aside>
      <main className="content">
        <div className="header">
          <div/>
          <div className="user">
            <span className="badge">{user?.name || 'Guest'}</span>
            {user && <button className="btn secondary" onClick={logout}>Logout</button>}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
