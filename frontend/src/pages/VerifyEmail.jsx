import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyEmail, resendCode } from '../services/auth'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await verifyEmail(email, code)
      navigate('/login')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Código inválido')
    }
  }

  async function handleResend() {
    await resendCode(email)
    setMessage('Novo código enviado!')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Verificar e-mail</h2>
      <p>Enviamos um código para {email}</p>
      <form onSubmit={handleSubmit}>
        <input placeholder="Código de 6 dígitos" value={code} onChange={(e) => setCode(e.target.value)} required style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
        {message && <p>{message}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}>Confirmar</button>
      </form>
      <button onClick={handleResend} style={{ width: '100%', padding: '0.5rem' }}>Reenviar código</button>
    </div>
  )
}
