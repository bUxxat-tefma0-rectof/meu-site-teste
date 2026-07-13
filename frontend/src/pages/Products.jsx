import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/products'

export default function Products() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h2>Produtos</h2>
      <div className="product-grid">
        {products.map((p) => (
          <Link key={p.id} to={`/produtos/${p.id}`} className="card product-card">
            <div className="product-image-placeholder">
              {p.main_image_url ? <img src={p.main_image_url} alt={p.name} /> : <span>{p.name[0]}</span>}
            </div>
            <div className="product-card-body">
              <h3>{p.name}</h3>
              <span className="price-tag">{(p.promotional_price || p.price).toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
