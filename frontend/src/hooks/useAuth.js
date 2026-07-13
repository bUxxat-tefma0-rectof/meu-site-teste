import { useState, useEffect } from 'react'
import { isAuthenticated } from '../services/auth'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())

  useEffect(() => {
    setAuthenticated(isAuthenticated())
  }, [])

  return { authenticated, setAuthenticated }
}
