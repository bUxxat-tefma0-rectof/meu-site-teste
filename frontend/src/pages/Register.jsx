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
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="card auth-card">
        <h2>Criar conta</h2>
        <input name="full_name" placeholder="Nome completo" onChange={handleChange} required />
        <input name="username" placeholder="Usuário" onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" onChange={handleChange} required />
        <input name="phone" placeholder="Telefone" onChange={handleChange} />
        <input name="password" type="password" placeholder="Senha" onChange={handleChange} required />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" style={{ width: '100%' }}>Cadastrar</button>
      </form>
    </div>
  )
}
