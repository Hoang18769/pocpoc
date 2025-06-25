// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      // Check if running in browser
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const token = getCookie('token')
      const userId = getCookie('userId')
      
      console.log('🔍 Checking auth status:', { token: !!token, userId: !!userId })

      if (token && userId) {
        // Optional: Verify token validity
        try {
          const [, payloadBase64] = token.split('.')
          const payload = JSON.parse(atob(payloadBase64))
          const now = Math.floor(Date.now() / 1000)

          if (payload.exp && payload.exp > now) {
            setIsAuthenticated(true)
            setUser({ id: userId, username: payload.username })
            console.log('✅ User authenticated')
          } else {
            console.log('⏰ Token expired')
            logout()
          }
        } catch (error) {
          console.log('💥 Token parsing error:', error)
          logout()
        }
      } else {
        console.log('❌ No valid credentials found')
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (token, userId, username) => {
    try {
      console.log('🔐 Login called with:', { token: !!token, userId, username })
      
      // Set cookies with proper settings
      setCookie('token', token, 1) // 1 day expiry
      setCookie('userId', userId, 1)
      
      // Update state
      setIsAuthenticated(true)
      setUser({ id: userId, username })
      
      console.log('✅ Login successful, cookies set')
      
      // Verify cookies were set
      setTimeout(() => {
        const tokenCheck = getCookie('token')
        const userIdCheck = getCookie('userId')
        console.log('🍪 Cookie verification:', { 
          token: !!tokenCheck, 
          userId: !!userIdCheck 
        })
      }, 100)
      
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const logout = () => {
    try {
      // Remove cookies
      deleteCookie('token')
      deleteCookie('userId')
      
      // Update state
      setIsAuthenticated(false)
      setUser(null)
      
      console.log('🔓 Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Cookie utility functions
const setCookie = (name, value, days) => {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=lax`
  console.log(`🍪 Setting cookie: ${name}`)
}

const getCookie = (name) => {
  if (typeof window === 'undefined') return null
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name) => {
  if (typeof window === 'undefined') return
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  console.log(`🗑️ Deleting cookie: ${name}`)
}