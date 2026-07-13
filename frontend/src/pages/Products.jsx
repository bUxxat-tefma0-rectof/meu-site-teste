import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/products'

export default function Products() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Produtos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {products.map((p) => (
          <Link key={p.id} to={`/produtos/${p.id}`} style={{ border: '1px solid #ddd', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
            <h3>{p.name}</h3>
            <p>R$ {(p.promotional_price || p.price).toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
