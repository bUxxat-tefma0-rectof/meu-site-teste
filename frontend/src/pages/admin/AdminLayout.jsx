import { Link, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      <nav style={{ width: '200px', borderRight: '1px solid #ddd', padding: '1rem' }}>
        <h3>Admin</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/conteudo-home">Conteúdo da Home</Link></li>
          <li><Link to="/admin/produtos">Produtos</Link></li>
          <li><Link to="/admin/pedidos">Pedidos</Link></li>
          <li><Link to="/admin/categorias">Categorias</Link></li>
          <li><Link to="/admin/cupons">Cupons</Link></li>
          <li><Link to="/admin/usuarios">Usuários</Link></li>
        </ul>
      </nav>
      <div style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </div>
    </div>
  )
}
