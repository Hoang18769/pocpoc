import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers = [];

// ✅ Event system cho socket reconnection
const tokenEventListeners = [];

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

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
  
  // ✅ Thông báo cho socket về token mới
  if (newToken) {
    notifyTokenRefresh(newToken);
  }
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
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
    const token = localStorage.getItem("accessToken");
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
      subscribeTokenRefresh(newToken => {
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        } else {
          reject(new Error("Failed to refresh token"));
        }
      });
    });
  }

  isRefreshing = true;
  try {
    const refreshInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });

    const { data } = await refreshInstance.post("/v1/auth/refresh", {});
    const newToken = data.body?.token;
    if (!newToken) throw new Error("No new token in refresh response");

    // ✅ Cập nhật token mới
    localStorage.setItem("accessToken", newToken);
    document.cookie = `accessToken=${newToken}; path=/; max-age=300`; // 5 phút
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    console.log("🔄 Token refreshed successfully");
    onTokenRefreshed(newToken);
    return api(originalRequest);
  } catch (refreshErr) {
    console.error("❌ Token refresh failed:", refreshErr);
    // ❌ Refresh thất bại: xoá toàn bộ thông tin session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    document.cookie = `accessToken=; path=/; max-age=0`;
    delete api.defaults.headers.common.Authorization;
    onTokenRefreshed(null);

    // ✅ Thông báo socket về việc logout
    notifyTokenRefresh(null);

    if (typeof window !== "undefined") {
      setTimeout(() => (window.location.href = "/register"), 100);
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

// ✅ Hàm setAuthToken (dùng khi login thành công hoặc khởi tạo session)
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("accessToken", token);
    document.cookie = `accessToken=${token}; path=/; max-age=300`;
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // ✅ Thông báo cho socket về token mới
    notifyTokenRefresh(token);
  } else {
    localStorage.removeItem("accessToken");
    document.cookie = `accessToken=; path=/; max-age=0`;
    delete api.defaults.headers.common.Authorization;
    
    // ✅ Thông báo cho socket về việc logout
    notifyTokenRefresh(null);
  }
}

export function getAuthToken() {
  return localStorage.getItem("accessToken");
}

export function isTokenValid() {
  const token = localStorage.getItem("accessToken");
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

// ✅ Hàm xoá session hoàn toàn (logout)
export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  document.cookie = `accessToken=; path=/; max-age=0`;
  delete api.defaults.headers.common.Authorization;
  
  // ✅ Thông báo cho socket về việc logout
  notifyTokenRefresh(null);
}

export default api;