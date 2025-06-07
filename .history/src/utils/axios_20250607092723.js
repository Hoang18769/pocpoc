import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers = [];

// Khi token mới có, gọi callback để retry tất cả request chờ
function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

// Thêm callback vào hàng đợi, chờ token mới
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// Danh sách endpoint không cần token
const PUBLIC_ENDPOINTS = [
  "/v1/auth/login",
  "/v1/auth/register",
  "/v1/forgot-password",
  "/v1/update-password",
  "/v1/auth/verify-email",
  "/v1/auth/refresh",
];

// Chỉ match exact path (không xét query params)
function isPublicEndpoint(url) {
  if (!url) return false;
  const path = url.split("?")[0];
  return PUBLIC_ENDPOINTS.includes(path);
}

// Interceptor request: tự động thêm header Authorization khi cần
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

// Hàm thực hiện refresh token và retry request gốc
async function handleTokenRefresh(originalRequest) {
  if (isRefreshing) {
    // Nếu đang refresh, trả về Promise chờ token mới rồi retry
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

  // Nếu chưa refresh, bắt đầu quy trình
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

    // Cập nhật token mới
    localStorage.setItem("accessToken", newToken);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    // Gọi tất cả request đang chờ với token mới
    onTokenRefreshed(newToken);

    // Retry request gốc
    return api(originalRequest);
  } catch (refreshErr) {
    // Nếu refresh thất bại: xóa token và notify
    localStorage.removeItem("accessToken");
        localStorage.removeItem("accessToken");

    delete api.defaults.headers.common.Authorization;
    onTokenRefreshed(null);

    // Redirect về login/register
    if (typeof window !== "undefined") {
      setTimeout(() => (window.location.href = "/register"), 100);
    }
    return Promise.reject(refreshErr);
  } finally {
    isRefreshing = false;
  }
}

// Interceptor response: bắt lỗi 401 để refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Nếu có response từ server và status = 401, chưa retry, không phải public và không phải chính /refresh
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

// Các hàm tiện ích
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
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp > now : true;
  } catch {
    return false;
  }
}

export default api;
