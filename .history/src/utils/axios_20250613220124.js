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
    if (isClient) {
      document.cookie = `accessToken=${newToken}; path=/; max-age=${60 * 5}`; // 5 phút
    }
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
      setTimeout(() => window.location.href = "/login", 100);
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

export function setAuthToken(token) {
  if (token) {
    safeLocalStorage.setItem("accessToken", token);
    if (isClient) {
      document.cookie = `accessToken=${token}; path=/; max-age=${60 * 5}`;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    notifyTokenRefresh(token);
  } else {
    clearSession();
  }
}

export function getAuthToken() {
  return safeLocalStorage.getItem("accessToken");
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

export function clearSession() {
  safeLocalStorage.removeItem("accessToken");
  safeLocalStorage.removeItem("userName");
  safeLocalStorage.removeItem("userId");
  
  if (isClient) {
    document.cookie = `accessToken=; path=/; max-age=0`;
  }
  
  delete api.defaults.headers.common.Authorization;
  notifyTokenRefresh(null);
}

export default api;