import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

const PUBLIC_ENDPOINTS = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/forgot-password',
  '/v1/auth/reset-password',
  '/v1/auth/verify-email',
  '/v1/auth/refresh',
];

function isPublicEndpoint(url) {
  if (!url) return false;
  const pathname = url.split('?')[0];
  return PUBLIC_ENDPOINTS.some(endpoint =>
    pathname.includes(endpoint) || pathname.endsWith(endpoint)
  );
}

// Interceptor thêm access token
api.interceptors.request.use(
  (config) => {
    if (isPublicEndpoint(config.url) || config.skipAuth) return config;
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: xử lý 401 và retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response && error.code === 'ERR_NETWORK' && !originalRequest._retry && !isPublicEndpoint(originalRequest.url)) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      console.log("🔄 [NETWORK] Refreshing token...");

      try {
        const refreshRes = await axios.post(
          '/v1/auth/refresh',
          {},
          {
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            withCredentials: true,
            timeout: 15000,
          }
        );

        const newToken = refreshRes?.data?.body?.token;

        if (newToken) {
          console.log("✅ [NETWORK] Token refreshed");
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn("❌ [NETWORK] Refresh failed");
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common.Authorization;
        onTokenRefreshed(null);
        if (typeof window !== 'undefined') {
          setTimeout(() => window.location.href = "/register", 100);
        }
      } finally {
        isRefreshing = false;
      }
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(originalRequest.url) &&
      !originalRequest.skipAuth &&
      originalRequest.url !== '/v1/auth/refresh'
    ) {
      originalRequest._retry = true;
      console.log("⚠️ [401] Access token expired. Attempting refresh...");

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              console.log("🔁 [401] Retrying request with new token:", originalRequest.url);
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          '/v1/auth/refresh',
          {},
          {
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            withCredentials: true,
            timeout: 15000,
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const newToken = refreshRes?.data?.body?.token;

        if (newToken) {
          console.log("✅ [401] Token refreshed successfully");
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          return api(originalRequest);
        } else {
          throw new Error("No token received from refresh");
        }
      } catch (refreshError) {
        console.error("❌ [401] Refresh failed", refreshError);
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common.Authorization;
        onTokenRefreshed(null);
        if (typeof window !== 'undefined') {
          setTimeout(() => (window.location.href = "/register"), 100);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Tiện ích: Set & Get token
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return localStorage.getItem("accessToken");
}

export function isTokenValid() {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export default api;
