import { Link, useNavigate } from 'react-router-dom'
import { logout, isAuthenticated } from '../services/auth'

export default function Header() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ddd' }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Meu Site</Link>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/produtos">Produtos</Link>
        <Link to="/carrinho">Carrinho</Link>
        {isAuthenticated() ? (
          <>
            <Link to="/meus-pedidos">Meus Pedidos</Link>
            <button onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </nav>
    </header>
  )
}
