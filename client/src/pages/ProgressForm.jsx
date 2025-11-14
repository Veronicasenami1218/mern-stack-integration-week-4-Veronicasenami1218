import React, { useEffect, useState } from 'react'
import { categoryService, postService } from '../services/api'

export default function ProgressForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await categoryService.getAllCategories()
        setCategories(res.data || [])
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load categories')
      }
    }
    loadCats()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await postService.createPost({ title, content, category })
      setTitle('')
      setContent('')
      setCategory('')
      alert('Progress record created')
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create progress')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Add Progress</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ width: '100%' }}>
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}
