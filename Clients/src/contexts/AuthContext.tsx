import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client'

interface AuthCtx {
  token: string | null
  username: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthCtx>({
  token: null, username: null,
  login: async () => {}, logout: () => {},
  isAuthenticated: false,
})

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(USER_KEY))

  const login = useCallback(async (usernameInput: string, password: string) => {
    const res = await api.post('/api/admin/login', { username: usernameInput, password })
    const t: string = res.data.access_token
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, usernameInput)
    setToken(t)
    setUsername(usernameInput)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUsername(null)
    delete api.defaults.headers.common['Authorization']
  }, [])

  // Always attach token to axios if present
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
