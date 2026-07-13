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
    <div style={{ padding: '2rem' }}>
      <h2>Carrinho</h2>
      {items.length === 0 && <p>Seu carrinho está vazio.</p>}
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', padding: '0.5rem 0' }}>
          <span>{item.product.name} x{item.quantity}</span>
          <span>R$ {((item.product.promotional_price || item.product.price) * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeItem(index)}>Remover</button>
        </div>
      ))}
      {items.length > 0 && (
        <>
          <h3>Total: R$ {total.toFixed(2)}</h3>
          <button onClick={() => navigate('/checkout')} style={{ padding: '0.5rem 1rem' }}>Finalizar Compra</button>
        </>
      )}
    </div>
  )
}
