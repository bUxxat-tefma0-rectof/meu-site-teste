import { useEffect, useState } from 'react'
import { getUsers, toggleUserActive } from '../../services/admin'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    loadUsers()
  }, [])

  function loadUsers() {
    getUsers().then(setUsers)
  }

  async function handleToggle(userId) {
    await toggleUserActive(userId)
    loadUsers()
  }

  return (
    <div>
      <h2>Usuários</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ textAlign: 'left' }}>Nome</th>
            <th>E-mail</th>
            <th>Ativo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.is_active ? 'Sim' : 'Não'}</td>
              <td><button onClick={() => handleToggle(u.id)}>Alternar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
