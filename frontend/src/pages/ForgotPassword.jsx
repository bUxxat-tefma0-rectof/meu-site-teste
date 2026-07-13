import { useState } from 'react'
import { forgotPassword } from '../services/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    await forgotPassword(email)
    setMessage('Se o e-mail existir, você receberá um link de recuperação.')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Recuperar senha</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
        {message && <p>{message}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>Enviar link</button>
      </form>
    </div>
  )
}
