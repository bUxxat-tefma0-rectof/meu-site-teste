import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkout } from '../services/orders'

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [couponCode, setCouponCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleCheckout() {
    setError('')
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')

    if (cart.length === 0) {
      setError('Carrinho vazio')
      return
    }

    try {
      const order = await checkout({
        items: cart,
        coupon_code: couponCode || null,
        payment_method: paymentMethod,
      })
      localStorage.removeItem('cart')
      navigate('/meus-pedidos', { state: { orderId: order.id } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao finalizar pedido')
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Finalizar Pedido</h2>

      <label>Método de pagamento:</label>
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
        <option value="pix">PIX</option>
        <option value="cartao">Cartão</option>
        <option value="boleto">Boleto</option>
      </select>

      <label>Cupom de desconto (opcional):</label>
      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleCheckout} style={{ width: '100%', padding: '0.5rem' }}>Confirmar Pedido</button>
    </div>
  )
}
