import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  email: string
  isActive: boolean
  isTotpEnabled: boolean
  createdAt: string
  updatedAt: string
  roles: Array<{
    id: number
    name: string
    description: string
  }>
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    setLoading(false)
  }, [])

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    router.push('/')
  }

  const isAuthenticated = !!token && !!user

  const hasRole = (roleName: string) => {
    return user?.roles?.some(role => role.name === roleName) ?? false
  }

  const hasPermission = (permissionName: string) => {
    // This is a simplified check - in a real app you'd check permissions
    // For now, just check if user has admin role for admin permissions
    return hasRole('Superadmin') || hasRole('Admin')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasPermission
  }
}
