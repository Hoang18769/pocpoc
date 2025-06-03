import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ví dụ: "http://localhost:80"
  withCredentials: true, // gửi cookie HttpOnly (refresh token)
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

// Thêm access token vào header Authorization nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi 401, tự động refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu đã retry rồi thì không retry nữa tránh vòng lặp vô tận
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Nếu đang refresh thì chờ token mới
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Gọi refresh token đúng url với baseURL
        const refreshRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes?.data?.body?.token;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          return api(originalRequest);
        } else {
          throw new Error("No token in refresh response");
        }
      } catch (err) {
        localStorage.removeItem("accessToken");
        // Có thể redirect sang trang đăng nhập nếu refresh fail
        // window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
