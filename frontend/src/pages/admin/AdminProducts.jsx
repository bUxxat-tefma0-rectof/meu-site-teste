import { useEffect, useState } from 'react'
import { getProducts } from '../../services/products'
import { createProduct, deleteProduct } from '../../services/admin'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', slug: '', price: '', stock: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  function loadProducts() {
    getProducts().then(setProducts)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createProduct({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      })
      setForm({ name: '', slug: '', price: '', stock: '' })
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar produto')
    }
  }

  async function handleDelete(id) {
    await deleteProduct(id)
    loadProducts()
  }

  return (
    <div>
      <h2>Produtos</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gap: '0.5rem', maxWidth: '400px' }}>
        <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input name="slug" placeholder="Slug (ex: camiseta-azul)" value={form.slug} onChange={handleChange} required />
        <input name="price" type="number" step="0.01" placeholder="Preço" value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Estoque" value={form.stock} onChange={handleChange} required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Criar Produto</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ textAlign: 'left' }}>Nome</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{p.name}</td>
              <td>R$ {p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td><button onClick={() => handleDelete(p.id)}>Excluir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
