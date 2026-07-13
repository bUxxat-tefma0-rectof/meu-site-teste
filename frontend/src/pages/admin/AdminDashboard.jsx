import { useEffect, useState } from 'react'
import { getDashboard } from '../../services/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => setError('Acesso negado. Você precisa ser administrador.'))
  }, [])

  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>
  if (!stats) return <p style={{ padding: '2rem' }}>Carregando...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <Card label="Usuários" value={stats.total_users} />
        <Card label="Produtos" value={stats.total_products} />
        <Card label="Pedidos" value={stats.total_orders} />
        <Card label="Pedidos Pendentes" value={stats.orders_pending} />
        <Card label="Faturamento" value={`R$ ${stats.total_revenue.toFixed(2)}`} />
      </div>
    </div>
  )
}

function Card({ label, value }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
    </div>
  )
}
