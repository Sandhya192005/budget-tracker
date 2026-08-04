import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getCurrentUser, setCurrentUser, createUser, authenticateUser } from '../lib/storage'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: { user: User } | null; error: { message: string } | null }>
  signIn: (email: string, password: string) => Promise<{ data: { user: User } | null; error: { message: string } | null }>
  signOut: () => Promise<{ error: null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const newUser = await createUser(email, password, fullName)
      setUser(newUser)
      setCurrentUser(newUser)
      return { data: { user: newUser }, error: null }
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authenticatedUser = await authenticateUser(email, password)
      if (authenticatedUser) {
        setUser(authenticatedUser)
        setCurrentUser(authenticatedUser)
        return { data: { user: authenticatedUser }, error: null }
      }
      return { data: null, error: { message: 'Invalid email or password' } }
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } }
    }
  }

  const signOut = async () => {
    setUser(null)
    setCurrentUser(null)
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
