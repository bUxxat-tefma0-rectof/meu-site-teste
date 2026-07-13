import { useEffect, useState } from 'react'
import { getCategories, createCategory } from '../../services/admin'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', slug: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  function loadCategories() {
    getCategories().then(setCategories)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createCategory(form)
      setForm({ name: '', slug: '' })
      loadCategories()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar categoria')
    }
  }

  return (
    <div>
      <h2>Categorias</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gap: '0.5rem', maxWidth: '400px' }}>
        <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Criar Categoria</button>
      </form>
      <ul>
        {categories.map((c) => (
          <li key={c.id}>{c.name} ({c.slug})</li>
        ))}
      </ul>
    </div>
  )
}
