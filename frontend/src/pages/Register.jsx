import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/auth'

const COUNTRY_CODES = [
  { code: '+55', label: '🇧🇷 +55 Brasil' },
  { code: '+351', label: '🇵🇹 +351 Portugal' },
  { code: '+1', label: '🇺🇸 +1 EUA' },
  { code: '+34', label: '🇪🇸 +34 Espanha' },
  { code: '+54', label: '🇦🇷 +54 Argentina' },
]

const HOW_FOUND_OPTIONS = [
  'Instagram',
  'Facebook',
  'Google',
  'TikTok',
  'Indicação de amigo',
  'YouTube',
  'Outro',
]

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    country_code: '+55',
    phone: '',
    password: '',
    how_found_us: '',
    terms_accepted: false,
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    if (name === 'phone') {
      setForm({ ...form, phone: formatPhone(value) })
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/verificar-email', { state: { email: form.email } })
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Dados inválidos')
      } else {
        setError(detail || 'Erro ao cadastrar')
      }
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="card auth-card">
        <h2>Criar conta</h2>

        <input name="full_name" placeholder="Nome e sobrenome" value={form.full_name} onChange={handleChange} required />
        <input name="username" placeholder="Usuário" value={form.username} onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />

        <div className="phone-row">
          <select name="country_code" value={form.country_code} onChange={handleChange}>
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <input name="phone" placeholder="(11) 99999-9999" value={form.phone} onChange={handleChange} maxLength={15} />
        </div>

        <input
          name="password"
          type="password"
          placeholder="Senha forte (8+ caracteres, A-z, 0-9, símbolo)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
        />

        <select name="how_found_us" value={form.how_found_us} onChange={handleChange}>
          <option value="">Como você nos conheceu?</option>
          {HOW_FOUND_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <label className="terms-checkbox">
          <input type="checkbox" name="terms_accepted" checked={form.terms_accepted} onChange={handleChange} required />
          <span>
            Li e aceito os <Link to="/termos" target="_blank">Termos de Uso</Link> e a{' '}
            <Link to="/privacidade" target="_blank">Política de Privacidade</Link>
          </span>
        </label>

        {error && <p className="form-error">{error}</p>}
        <button type="submit" style={{ width: '100%' }}>Cadastrar</button>
      </form>
    </div>
  )
}
