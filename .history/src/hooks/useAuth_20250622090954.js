"use client";

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

  // Đơn giản hóa checkAuth - chỉ dựa vào axios utils
  const checkAuth = useCallback(() => {
    const auth = getAuthInfo()
    const authenticated = isAuthenticated()
    
    console.log('🔍 useAuth checkAuth:', {
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

    // Listen for token refresh events from axios interceptor
    const unsubscribe = onTokenRefresh((newToken) => {
      console.log('🔄 useAuth token refresh event:', !!newToken)
      
      if (newToken) {
        // Token refreshed successfully
        checkAuth()
      } else {
        // Token was cleared (logout or failed refresh)
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          authInfo: null
        })
        // Don't redirect here - let the interceptor handle it
      }
    })

    return unsubscribe
  }, [checkAuth])

  const logout = useCallback(() => {
    console.log('🚪 useAuth logout...')
    clearSession() // This will trigger onTokenRefresh with null
    router.push('/register')
  }, [router])

  const login = useCallback(async (token, userId, userName) => {
    console.log('🔐 useAuth login process:', { userId, userName })
    
    try {
      // Let axios utils handle all the cookie/storage logic
      setAuthToken(token, userId, userName)
      
      // Small delay để đảm bảo cookies được set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check auth status
      const authenticated = checkAuth()
      
      console.log('✅ useAuth login result:', { authenticated })
      
      if (authenticated) {
        // Don't need router.refresh() - just navigate
        router.push('/index')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ useAuth login error:', error)
      return false
    }
  }, [router, checkAuth])

  // Helper method for debugging
  const refreshAuth = useCallback(() => {
    console.log('🔄 useAuth forcing refresh...')
    return checkAuth()
  }, [checkAuth])

  return {
    ...authState,
    logout,
    login,
    refreshAuth
  }
}