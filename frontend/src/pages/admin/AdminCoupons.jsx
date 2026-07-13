import { useEffect, useState } from 'react'
import { getCoupons, createCoupon } from '../../services/admin'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState({ code: '', discount_percent: '', max_uses: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    loadCoupons()
  }, [])

  function loadCoupons() {
    getCoupons().then(setCoupons)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createCoupon({
        code: form.code,
        discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      })
      setForm({ code: '', discount_percent: '', max_uses: '' })
      loadCoupons()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar cupom')
    }
  }

  return (
    <div>
      <h2>Cupons</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gap: '0.5rem', maxWidth: '400px' }}>
        <input placeholder="Código (ex: PROMO10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <input placeholder="Desconto % (ex: 10)" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
        <input placeholder="Máximo de usos (opcional)" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Criar Cupom</button>
      </form>
      <ul>
        {coupons.map((c) => (
          <li key={c.id}>{c.code} - {c.discount_percent}% - usado {c.used_count}x</li>
        ))}
      </ul>
    </div>
  )
}
