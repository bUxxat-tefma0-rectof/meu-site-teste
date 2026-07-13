import { Link, useNavigate } from 'react-router-dom'
import { logout, isAuthenticated } from '../services/auth'

export default function Header() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">Meu Site</Link>
        <nav className="nav-links">
          <Link to="/produtos">Produtos</Link>
          <Link to="/carrinho">Carrinho</Link>
          {isAuthenticated() ? (
            <>
              <Link to="/meus-pedidos">Meus Pedidos</Link>
              <button onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <Link to="/login" className="btn-accent-link">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
