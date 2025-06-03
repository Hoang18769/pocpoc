import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true, // gửi cookie chứa refresh token (HttpOnly)
});

let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  console.log("✅ Gọi lại các request bị chờ sau khi refresh:", newToken);
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Interceptor thêm access token vào request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Thêm access token vào request:", token);
    }
  } catch (err) {
    console.warn("⚠️ Lỗi khi đọc accessToken từ localStorage:", err);
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
      !originalRequest._retry
    ) {
      console.warn("🚫 Nhận lỗi 401 - accessToken có thể đã hết hạn");

      originalRequest._retry = true;

      if (isRefreshing) {
        console.log("⏳ Đang refresh - đợi token mới...");
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            console.log("🔁 Gửi lại request với token mới sau khi chờ:", newToken);
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      console.log("🔄 Bắt đầu gọi API refresh token...");

      try {
        const refreshRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}//auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes?.data?.body?.token;

        if (newToken) {
          console.log("✅ Refresh token thành công:", newToken);
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          return api(originalRequest);
        } else {
          throw new Error("❌ Không tìm thấy access token trong phản hồi refresh.");
        }
      } catch (err) {
        console.error("❌ Refresh token thất bại:", err);
        localStorage.removeItem("accessToken");
        //window.location.href = "/register";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
