// utils/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`, // chỉnh lại nếu BE ở domain khác
  withCredentials: true, // cần để gửi cookie refresh token (HttpOnly)
});

// Biến để tránh vòng lặp gọi refresh nhiều lần cùng lúc
let isRefreshing = false;
let refreshSubscribers = [];

// Gọi tất cả request đang đợi token mới
function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// Thêm callback để chờ token mới
function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Interceptor đính access token vào request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor xử lý lỗi 401 và tự động refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry // tránh lặp vô hạn
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          "http://localhost:8080/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data.body.token;

        localStorage.setItem("accessToken", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        onTokenRefreshed(newToken);
        return api(originalRequest);
      } catch (err) {
        // Refresh fail → logout
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
