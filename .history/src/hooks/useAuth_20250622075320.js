"use client"
// hooks/useAuth.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthInfo, clearSession, isAuthenticated, onTokenRefresh, setAuthToken } from '@/utils/axios'

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    authInfo: null
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const auth = getAuthInfo()
      const authenticated = isAuthenticated()
      
      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        authInfo: auth
      })
    }

    // Check auth khi component mount
    checkAuth()

    // Lắng nghe sự kiện token refresh từ api interceptor
    const unsubscribe = onTokenRefresh((newToken) => {
      if (newToken) {
        checkAuth() // Re-check auth khi có token mới
      } else {
        // Token bị xóa, cập nhật state
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          authInfo: null
        })
      }
    })

    return unsubscribe
  }, [])

  const logout = () => {
    clearSession()
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      authInfo: null
    })
    router.push('/register')
  }

  const login = (token, userId, userName) => {
    // Sử dụng setAuthToken từ utils/axios
    setAuthToken(token, userId, userName)
    
    const auth = getAuthInfo()
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      authInfo: auth
    })
  }

  return {
    ...authState,
    logout,
    login
  }
}