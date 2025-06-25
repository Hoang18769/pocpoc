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

  // Sync từ localStorage
  const syncFromLocalStorage = useCallback(() => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const userName = localStorage.getItem('userName')

      console.log('🔄 Syncing from localStorage:', {
        hasToken: !!token,
        userId,
        userName,
        timestamp: new Date().toLocaleTimeString()
      })

      if (token && userId) {
        // Sync với axios utils nếu có token trong localStorage
        setAuthToken(token, userId, userName)
        return true
      } else {
        // Clear session nếu không có token trong localStorage
        clearSession()
        return false
      }
    } catch (error) {
      console.error('❌ Error syncing from localStorage:', error)
      return false
    }
  }, [])

  // Kiểm tra auth status
  const checkAuth = useCallback(() => {
    // Đầu tiên sync từ localStorage
    const hasLocalStorageAuth = syncFromLocalStorage()
    
    // Sau đó kiểm tra với axios utils
    const auth = getAuthInfo()
    const authenticated = isAuthenticated()

    console.log('🔍 useAuth checkAuth:', {
      hasLocalStorageAuth,
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
  }, [syncFromLocalStorage])

  // Listen for localStorage changes từ other tabs
  const handleStorageChange = useCallback((e) => {
    if (e.key === 'token' || e.key === 'userId') {
      console.log('📱 localStorage changed in another tab:', e.key)
      checkAuth()
    }
  }, [checkAuth])

  useEffect(() => {
    // Initial auth check
    checkAuth()

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange)

    // Listen for token refresh events from axios interceptor
    const unsubscribe = onTokenRefresh((newToken) => {
      console.log('🔄 useAuth token refresh event:', !!newToken)
      
      if (newToken) {
        // Token refreshed successfully
        checkAuth()
      } else {
        // Token was cleared (logout or failed refresh)
        // Also clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          authInfo: null
        })
      }
    })

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      unsubscribe()
    }
  }, [checkAuth, handleStorageChange])

  const logout = useCallback(() => {
    console.log('🚪 useAuth logout...')
    
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    
    // Clear session - this will trigger onTokenRefresh with null
    clearSession()
    
    router.push('/register')
  }, [router])

  const login = useCallback(async (token, userId, userName) => {
    console.log('🔐 useAuth login process:', { userId, userName })

    try {
      // Save to localStorage first
      localStorage.setItem('token', token)
      localStorage.setItem('userId', userId)
      if (userName) {
        localStorage.setItem('userName', userName)
      }

      // Let axios utils handle all the cookie/storage logic
      setAuthToken(token, userId, userName)

      // Small delay để đảm bảo cookies được set
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check auth status
      const authenticated = checkAuth()

      console.log('✅ useAuth login result:', { authenticated })

      if (authenticated) {
        router.push('/index')
        return true
      }

      return false
    } catch (error) {
      console.error('❌ useAuth login error:', error)
      
      // Clear localStorage on error
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      
      return false
    }
  }, [router, checkAuth])

  // Helper method for debugging
  const refreshAuth = useCallback(() => {
    console.log('🔄 useAuth forcing refresh...')
    return checkAuth()
  }, [checkAuth])

  // Helper method to manually sync from localStorage
  const syncAuth = useCallback(() => {
    console.log('🔄 useAuth manual sync from localStorage...')
    return checkAuth()
  }, [checkAuth])

  return {
    ...authState,
    logout,
    login,
    refreshAuth,
    syncAuth
  }
}