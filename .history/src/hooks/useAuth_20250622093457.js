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

  // Sync từ localStorage - ĐÃ SỬA: dùng accessToken thay vì token
  const syncFromLocalStorage = useCallback(() => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const userId = localStorage.getItem('userId')
      const userName = localStorage.getItem('userName')

      console.log('🔄 Syncing from localStorage:', {
        hasAccessToken: !!accessToken,
        userId,
        userName,
        timestamp: new Date().toLocaleTimeString()
      })

      if (accessToken && userId) {
        // Sync với axios utils nếu có accessToken trong localStorage
        setAuthToken(accessToken, userId, userName)
        return true
      } else {
        // Clear session nếu không có accessToken trong localStorage
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

  // Listen for localStorage changes từ other tabs - ĐÃ SỬA: listen accessToken thay vì token
  const handleStorageChange = useCallback((e) => {
    if (e.key === 'accessToken' || e.key === 'userId') {
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
    const unsubscribe = onTokenRefresh((newAccessToken) => {
      console.log('🔄 useAuth token refresh event:', !!newAccessToken)
      
      if (newAccessToken) {
        // Token refreshed successfully
        checkAuth()
      } else {
        // Token was cleared (logout or failed refresh)
        // Also clear localStorage - ĐÃ SỬA: clear accessToken
        localStorage.removeItem('accessToken')
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
    
    // Clear localStorage - ĐÃ SỬA: clear accessToken
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    
    // Clear session - this will trigger onTokenRefresh with null
    clearSession()
    
    router.push('/register')
  }, [router])

  // ĐÃ SỬA: đổi param thành accessToken để nhất quán
  const login = useCallback(async (accessToken, userId, userName) => {
    console.log('🔐 useAuth login process:', { userId, userName, tokenLength: accessToken?.length })

    if (!accessToken || !userId) {
      console.error('❌ Invalid login data provided')
      return false
    }

    try {
      console.log('📝 Step 1: Setting auth token...')
      // Set auth token using axios utils (this handles both cookies and localStorage)
      const success = setAuthToken(accessToken, userId, userName)
      
      if (!success) {
        console.error('❌ Failed to set auth token')
        return false
      }

      console.log('⏳ Step 2: Waiting for cookies to be set...')
      // Wait longer for cookies to be properly set
      await new Promise(resolve => setTimeout(resolve, 300))

      console.log('🔍 Step 3: Verifying auth state...')
      // Verify the auth was set correctly
      const authInfo = getAuthInfo()
      const authenticated = isAuthenticated()
      
      console.log('📊 Auth verification:', {
        hasAuthInfo: !!authInfo,
        authenticated,
        cookieAccessToken: document.cookie.includes('accessToken='),
        cookieUserId: document.cookie.includes('userId=')
      })

      if (authenticated) {
        console.log('✅ Step 4: Login successful, redirecting...')
        // Use window.location for hard navigation to ensure middleware picks up cookies
        window.location.href = '/index'
        return true
      } else {
        console.error('❌ Authentication verification failed')
        return false
      }
      
    } catch (error) {
      console.error('❌ useAuth login error:', error)
      
      // Clear everything on error
      clearSession()
      
      return false
    }
  }, [])

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