import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../services/products'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    getProduct(id).then(setProduct)
  }, [id])

  if (!product) return <p className="container" style={{ padding: '2rem' }}>Carregando...</p>

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ product_id: product.id, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Adicionado ao carrinho!')
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '700px' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2>{product.name}</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>{product.description}</p>
        <p className="price-tag" style={{ fontSize: '1.5rem', display: 'block', margin: '1rem 0' }}>
          {(product.promotional_price || product.price).toFixed(2)}
        </p>
        <button className="btn-accent" onClick={addToCart}>Adicionar ao carrinho</button>
      </div>
    </div>
  )
}
