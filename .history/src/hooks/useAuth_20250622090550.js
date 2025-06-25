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

  // Memoize checkAuth to prevent unnecessary re-renders
  const checkAuth = useCallback(() => {
    const auth = getAuthInfo()
    const authenticated = isAuthenticated()
    
    console.log('🔍 Auth check:', {
      authenticated,
      authInfo: auth,
      timestamp: new Date().toLocaleTimeString(),
      cookies: {
        token: !!document.cookie.includes('token='),
        userId: !!document.cookie.includes('userId='),
        allCookies: document.cookie // Debug: xem tất cả cookies
      }
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
      
      // Force cookie set với explicit options
      if (typeof document !== 'undefined') {
        // Set cookies manually để đảm bảo chúng được set đúng cách
        document.cookie = `token=${token}; path=/; secure=${window.location.protocol === 'https:'}; samesite=lax`
        document.cookie = `userId=${userId}; path=/; secure=${window.location.protocol === 'https:'}; samesite=lax`
        if (userName) {
          document.cookie = `userName=${userName}; path=/; secure=${window.location.protocol === 'https:'}; samesite=lax`
        }
      }
      
      // Wait longer for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Get fresh auth info and update state
      const auth = getAuthInfo()
      const authenticated = isAuthenticated()
      
      console.log('✅ Login completed:', {
        authenticated,
        authInfo: auth,
        cookiesAfterLogin: {
          token: !!document.cookie.includes('token='),
          userId: !!document.cookie.includes('userId='),
          allCookies: document.cookie
        }
      })
      
      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        authInfo: auth
      })
      
      // Force page refresh để middleware có thể đọc cookies mới
      // Hoặc sử dụng router.refresh() nếu không muốn full refresh
      if (authenticated) {
        router.refresh() // Refresh server components
        router.push('/index')
      }
      
      return authenticated
    } catch (error) {
      console.error('❌ Login process error:', error)
      return false
    }
  }, [router])

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