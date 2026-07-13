import { useEffect, useState } from 'react'
import { getMyOrders } from '../services/orders'

export default function MyOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    getMyOrders().then(setOrders)
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Meus Pedidos</h2>
      {orders.length === 0 && <p>Nenhum pedido ainda.</p>}
      {orders.map((order) => (
        <div key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong>Pedido #{order.id}</strong></p>
          <p>Status: {order.status}</p>
          <p>Total: R$ {order.total.toFixed(2)}</p>
          <p>Pagamento: {order.payment_method}</p>
        </div>
      ))}
    </div>
  )
}
