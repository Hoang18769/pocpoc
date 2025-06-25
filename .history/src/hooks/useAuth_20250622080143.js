"use "
// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthInfo, clearSession, isAuthenticated, onTokenRefresh, setAuthToken } from '@/utils/axios'

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    authInfo: null
  })
  const router = useRouter()

  // Memoize checkAuth to prevent unnecessary re-renders
  const checkAuth = useCallback(() => {
    const auth = getAuthInfo()
    const authenticated = isAuthenticated()
    
    console.log('🔍 Auth check:', { 
      authenticated, 
      authInfo: auth,
      timestamp: new Date().toLocaleTimeString()
    })
    
    setAuthState({
      isAuthenticated: authenticated,
      isLoading: false,
      authInfo: auth
    })
    
    return authenticated
  }, [])

  useEffect(() => {
    // Initial auth check
    checkAuth()

    // Listen for token refresh events from api interceptor
    const unsubscribe = onTokenRefresh((newToken) => {
      console.log('🔄 Token refresh event:', !!newToken)
      
      if (newToken) {
        checkAuth() // Re-check auth when there's a new token
      } else {
        // Token was cleared, update state immediately
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          authInfo: null
        })
      }
    })

    return unsubscribe
  }, [checkAuth])

  const logout = useCallback(() => {
    console.log('🚪 Logging out...')
    clearSession()
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      authInfo: null
    })
    router.push('/register')
  }, [router])

  const login = useCallback(async (token, userId, userName) => {
    console.log('🔐 Login process starting...', { userId, userName })
    
    try {
      // Use setAuthToken from utils/axios
      setAuthToken(token, userId, userName)
      
      // Wait a bit for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get fresh auth info and update state
      const auth = getAuthInfo()
      const authenticated = isAuthenticated()
      
      console.log('✅ Login completed:', { 
        authenticated, 
        authInfo: auth,
        cookiesSet: !!document.cookie.includes('token=')
      })
      
      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        authInfo: auth
      })
      
      return authenticated
    } catch (error) {
      console.error('❌ Login process error:', error)
      return false
    }
  }, [])

  // Helper method to force re-check auth (useful for debugging)
  const refreshAuth = useCallback(() => {
    console.log('🔄 Forcing auth refresh...')
    return checkAuth()
  }, [checkAuth])

  return {
    ...authState,
    logout,
    login,
    refreshAuth // Export for debugging purposes
  }
}