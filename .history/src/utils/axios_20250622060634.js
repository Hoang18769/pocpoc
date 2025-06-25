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

// Hàm safeLocalStorage để tránh lỗi khi chạy trên server
const safeLocalStorage = {
  getItem: (key) => isClient ? localStorage.getItem(key) : null,
  setItem: (key, value) => isClient && localStorage.setItem(key, value),
  removeItem: (key) => isClient && localStorage.removeItem(key)
};

// Hàm để sync localStorage với cookies cho middleware
function syncAuthToCookies(token, userId, userName) {
  if (!isClient) return;
  
  if (token) {
    // Set cookies với thời gian sống 7 ngày cho middleware
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    if (userId) {
      document.cookie = `userId=${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
    if (userName) {
      document.cookie = `userName=${userName}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  } else {
    // Xóa cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
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
    const token = safeLocalStorage.getItem("accessToken");
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

    // Cập nhật token mới
    safeLocalStorage.setItem("accessToken", newToken);
    
    // Sync với cookies cho middleware (giữ nguyên userId và userName hiện tại)
    const userId = safeLocalStorage.getItem("userId");
    const userName = safeLocalStorage.getItem("userName");
    syncAuthToCookies(newToken, userId, userName);
    
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    // Thông báo cho các subscribers
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

// Cập nhật function setAuthToken để sync với cookies
export function setAuthToken(token, userId, userName) {
  if (token) {
    safeLocalStorage.setItem("accessToken", token);
    if (userId) safeLocalStorage.setItem("userId", userId);
    if (userName) safeLocalStorage.setItem("userName", userName);
    
    // Sync với cookies cho middleware
    syncAuthToCookies(token, userId, userName);
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    notifyTokenRefresh(token);
  } else {
    clearSession();
  }
}

export function getAuthToken() {
  return safeLocalStorage.getItem("accessToken");
}

export function getUserId() {
  return safeLocalStorage.getItem("userId");
}

export function getUserName() {
  return safeLocalStorage.getItem("userName");
}

// Thêm function để get toàn bộ auth info
export function getAuthInfo() {
  if (!isClient) return null;
  
  const token = safeLocalStorage.getItem("accessToken");
  const userId = safeLocalStorage.getItem("userId");
  const userName = safeLocalStorage.getItem("userName");
  
  return token && userId ? { token, userId, userName } : null;
}

export function isTokenValid() {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp > now : true;
  } catch {
    return false;
  }
}

// Thêm function để check authentication
export function isAuthenticated() {
  return getAuthInfo() !== null && isTokenValid();
}

export function clearSession() {
  safeLocalStorage.removeItem("accessToken");
  safeLocalStorage.removeItem("userName");
  safeLocalStorage.removeItem("userId");
  
  // Xóa cookies
  syncAuthToCookies(null);
  
  delete api.defaults.headers.common.Authorization;
  notifyTokenRefresh(null);
}

export default api;