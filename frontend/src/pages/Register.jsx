import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/auth'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/verificar-email', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao cadastrar')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Criar conta</h2>
      <form onSubmit={handleSubmit}>
        <input name="full_name" placeholder="Nome completo" onChange={handleChange} required style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
        <input name="username" placeholder="Usuário" onChange={handleChange} required style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
        <input name="email" type="email" placeholder="E-mail" onChange={handleChange} required style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
        <input name="phone" placeholder="Telefone" onChange={handleChange} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
        <input name="password" type="password" placeholder="Senha" onChange={handleChange} required style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>Cadastrar</button>
      </form>
    </div>
  )
}
