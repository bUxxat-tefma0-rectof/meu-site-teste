import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProduct } from '../services/products'

export default function Cart() {
  const [items, setItems] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const detailed = await Promise.all(
      cart.map(async (item) => {
        const product = await getProduct(item.product_id)
        return { ...item, product }
      })
    )
    setItems(detailed)
  }

  function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.splice(index, 1)
    localStorage.setItem('cart', JSON.stringify(cart))
    loadCart()
  }

  const total = items.reduce((sum, item) => {
    const price = item.product.promotional_price || item.product.price
    return sum + price * item.quantity
  }, 0)

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '700px' }}>
      <h2>Carrinho</h2>
      {items.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Seu carrinho está vazio.</p>}
      {items.map((item, index) => (
        <div key={index} className="card cart-item">
          <span>{item.product.name} x{item.quantity}</span>
          <span className="price-tag">{((item.product.promotional_price || item.product.price) * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeItem(index)} style={{ background: 'var(--color-danger)' }}>Remover</button>
        </div>
      ))}
      {items.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h3>Total: <span className="price-tag">{total.toFixed(2)}</span></h3>
          <button className="btn-accent" onClick={() => navigate('/checkout')} style={{ width: '100%' }}>Finalizar Compra</button>
        </div>
      )}
    </div>
  )
}
