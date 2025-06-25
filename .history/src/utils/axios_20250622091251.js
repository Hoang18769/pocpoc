import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers = [];
const tokenEventListeners = [];

// Helper function để kiểm tra môi trường client
const isClient = typeof window !== "undefined";

// Cookie utilities
// Cookie utilities - FIXED VERSION
const cookieUtils = {
  get: (name) => {
    if (!isClient) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },
  
  set: (name, value, maxAge = 7 * 24 * 60 * 60) => {
    if (!isClient) return;
    
    // Simple cookie set - không dùng max-age
    const expires = new Date();
    expires.setTime(expires.getTime() + maxAge * 1000);
    
    // Set cookie với format đơn giản
    const cookieString = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    
    console.log('🍪 Setting cookie:', cookieString);
    document.cookie = cookieString;
    
    // Verify cookie was set
    setTimeout(() => {
      const verified = cookieUtils.get(name);
      console.log(`🔍 Cookie ${name} verification:`, { 
        expected: value, 
        actual: verified, 
        success: verified === value 
      });
    }, 50);
  },
  
  remove: (name) => {
    if (!isClient) return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    console.log('🗑️ Removed cookie:', name);
  }
};

// Updated setAuthStorage function
function setAuthStorage(token, userId, userName) {
  if (!isClient) return;
  
  console.log('🔐 setAuthStorage called:', { 
    hasToken: !!token, 
    userId, 
    userName 
  });
  
  if (token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    
    // Set cookies one by one với verification
    cookieUtils.set('token', token, maxAge);
    cookieUtils.set('accessToken', token, maxAge); // Keep both for compatibility
    
    if (userId) {
      cookieUtils.set('userId', userId, maxAge);
    }
    
    if (userName) {
      cookieUtils.set('userName', userName, maxAge);
    }
    
    // Also update localStorage for compatibility
    try {
      localStorage.setItem('accessToken', token);
      if (userId) localStorage.setItem('userId', userId);
      if (userName) localStorage.setItem('userName', userName);
      console.log('✅ localStorage updated');
    } catch (error) {
      console.warn('⚠️ localStorage update failed:', error);
    }
    
    // Final verification
    setTimeout(() => {
      console.log('🔍 Final cookie verification:', {
        token: !!cookieUtils.get('token'),
        userId: !!cookieUtils.get('userId'),
        userName: !!cookieUtils.get('userName'),
        allCookies: document.cookie
      });
    }, 100);
    
  } else {
    // Clear everything
    console.log('🧹 Clearing all auth storage');
    ['token', 'accessToken', 'userId', 'userName'].forEach(key => {
      cookieUtils.remove(key);
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`⚠️ Failed to remove ${key} from localStorage:`, error);
      }
    });
  }
}
// Fallback to localStorage cho compatibility (but prioritize cookies)
const safeStorage = {
  getItem: (key) => {
    if (!isClient) return null;
    // Try cookies first, then localStorage as fallback
    const cookieValue = cookieUtils.get(key);
    if (cookieValue) return cookieValue;
    return localStorage.getItem(key);
  },
  
  setItem: (key, value) => {
    if (!isClient) return;
    // Set both cookie and localStorage for compatibility
    cookieUtils.set(key, value);
    localStorage.setItem(key, value);
  },
  
  removeItem: (key) => {
    if (!isClient) return;
    // Remove from both cookie and localStorage
    cookieUtils.remove(key);
    localStorage.removeItem(key);
  }
};

// Simplified auth storage using cookies as primary
function setAuthStorage(token, userId, userName) {
  if (!isClient) return;
  
  if (token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    cookieUtils.set('token', token, maxAge);
    cookieUtils.set('accessToken', token, maxAge); // Keep both for compatibility
    
    if (userId) cookieUtils.set('userId', userId, maxAge);
    if (userName) cookieUtils.set('userName', userName, maxAge);
    
    // Also update localStorage for compatibility
    localStorage.setItem('accessToken', token);
    if (userId) localStorage.setItem('userId', userId);
    if (userName) localStorage.setItem('userName', userName);
  } else {
    // Clear everything
    ['token', 'accessToken', 'userId', 'userName'].forEach(key => {
      cookieUtils.remove(key);
      localStorage.removeItem(key);
    });
  }
}

export function onTokenRefresh(callback) {
  tokenEventListeners.push(callback);
  return () => {
    const index = tokenEventListeners.indexOf(callback);
    if (index > -1) tokenEventListeners.splice(index, 1);
  };
}

function notifyTokenRefresh(newToken) {
  tokenEventListeners.forEach(callback => {
    try {
      callback(newToken);
    } catch (error) {
      console.error('Error in token refresh callback:', error);
    }
  });
}

const PUBLIC_ENDPOINTS = [
  "/v1/auth/login",
  "/v1/auth/register", 
  "/v1/register",
  "/v1/register/verify",
  "/v1/forgot-password",
  "/v1/update-password",
  "/v1/auth/verify-email",
  "/v1/auth/refresh",
];

function isPublicEndpoint(url) {
  if (!url) return false;
  const path = url.split("?")[0];
  return PUBLIC_ENDPOINTS.includes(path);
}

api.interceptors.request.use(
  config => {
    if (config.skipAuth || isPublicEndpoint(config.url)) {
      return config;
    }
    
    // Try to get token from cookie first, then localStorage
    const token = cookieUtils.get('token') || cookieUtils.get('accessToken') || safeStorage.getItem("accessToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => Promise.reject(err)
);

async function handleTokenRefresh(originalRequest) {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshSubscribers.push((token) => {
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        } else {
          reject(new Error("Failed to refresh token"));
        }
      });
    });
  }

  isRefreshing = true;
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`, 
      {},
      { 
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      }
    );

    const newToken = data.body?.token;
    if (!newToken) throw new Error("No new token in refresh response");

    // Get current user info
    const userId = getUserId();
    const userName = getUserName();
    
    // Update token storage
    setAuthStorage(newToken, userId, userName);
    
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    // Notify subscribers
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
    notifyTokenRefresh(newToken);

    return api(originalRequest);
  } catch (refreshErr) {
    console.error("❌ Token refresh failed:", refreshErr);
    clearSession();
    if (isClient) {
      setTimeout(() => window.location.href = "/register", 1000);
    }
    return Promise.reject(refreshErr);
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(originalRequest.url) &&
      !originalRequest.skipAuth &&
      originalRequest.url !== "/v1/auth/refresh"
    ) {
      originalRequest._retry = true;
      return handleTokenRefresh(originalRequest);
    }
    return Promise.reject(error);
  }
);

// Updated setAuthToken function with better cookie handling
export function setAuthToken(token, userId, userName) {
  console.log('🔐 Setting auth token:', { 
    hasToken: !!token, 
    userId, 
    userName,
    timestamp: new Date().toLocaleTimeString()
  });
  
  if (token) {
    // Store in both cookies and localStorage
    setAuthStorage(token, userId, userName);
    
    // Set axios default header
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // Notify listeners
    notifyTokenRefresh(token);
    
    console.log('✅ Auth token set successfully');
  } else {
    clearSession();
  }
}

export function getAuthToken() {
  // Try cookies first, then localStorage
  return cookieUtils.get('token') || cookieUtils.get('accessToken') || safeStorage.getItem("accessToken");
}

export function getUserId() {
  return cookieUtils.get('userId') || safeStorage.getItem("userId");
}

export function getUserName() {
  return cookieUtils.get('userName') || safeStorage.getItem("userName");
}

// Get complete auth info
export function getAuthInfo() {
  if (!isClient) return null;
  
  const token = getAuthToken();
  const userId = getUserId();
  const userName = getUserName();
  
  console.log('🔍 Getting auth info:', { 
    hasToken: !!token, 
    hasUserId: !!userId, 
    hasUserName: !!userName,
    timestamp: new Date().toLocaleTimeString()
  });
  
  return token && userId ? { token, userId, userName } : null;
}

export function isTokenValid() {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    const isValid = payload.exp ? payload.exp > now : true;
    
    console.log('🔍 Token validation:', { 
      hasToken: !!token,
      isValid,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiry',
      now: new Date(now * 1000).toLocaleString()
    });
    
    return isValid;
  } catch (error) {
    console.error('❌ Token validation error:', error);
    return false;
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  const authInfo = getAuthInfo();
  const tokenValid = isTokenValid();
  const authenticated = authInfo !== null && tokenValid;
  
  console.log('🔍 Authentication check:', { 
    hasAuthInfo: !!authInfo,
    tokenValid,
    authenticated,
    timestamp: new Date().toLocaleTimeString()
  });
  
  return authenticated;
}

export function clearSession() {
  console.log('🚪 Clearing session...');
  
  // Clear all auth storage
  setAuthStorage(null);
  
  // Remove axios header
  delete api.defaults.headers.common.Authorization;
  
  // Notify listeners
  notifyTokenRefresh(null);
  
  console.log('✅ Session cleared');
}

export default api;