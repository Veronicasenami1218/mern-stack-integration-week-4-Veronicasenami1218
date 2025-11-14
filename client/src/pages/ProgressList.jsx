import React, { useEffect, useState } from 'react'
import { postService } from '../services/api'

export default function ProgressList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await postService.getAllPosts(1, 20)
        setItems(res.data || [])
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load progress')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Progress Records</h2>
      {items.length === 0 && <p>No records yet.</p>}
      <ul>
        {items.map((p) => (
          <li key={p._id}>
            <strong>{p.title}</strong> — {new Date(p.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
