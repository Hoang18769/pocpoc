import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
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
api.interceptors.request.use(
  (config) => {
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
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi 401 và tự động refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu request bị lỗi không có response (network error)
    if (!error.response) {
      return Promise.reject(error);
    }

    // Chỉ xử lý lỗi 401 và không phải refresh endpoint
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') // Tránh infinite loop
    ) {
      console.warn("🚫 Nhận lỗi 401 - accessToken có thể đã hết hạn");

      originalRequest._retry = true;

      if (isRefreshing) {
        console.log("⏳ Đang refresh - đợi token mới...");
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              console.log("🔁 Gửi lại request với token mới sau khi chờ:", newToken);
              resolve(api(originalRequest));
            } else {
              reject(new Error("Failed to get new token"));
            }
          });
        });
      }

      isRefreshing = true;
      console.log("🔄 Bắt đầu gọi API refresh token...");

      try {
        // Sử dụng instance axios riêng cho refresh để tránh interceptor loop
        const refreshRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
          {},
          { 
            withCredentials: true,
            timeout: 10000 // Timeout cho refresh request
          }
        );

        const newToken = refreshRes?.data?.body?.token;

        if (newToken) {
          console.log("✅ Refresh token thành công:", newToken);
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          
          // Cập nhật token cho original request
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          
          onTokenRefreshed(newToken);
          return api(originalRequest);
        } else {
          throw new Error("❌ Không tìm thấy access token trong phản hồi refresh.");
        }
      } catch (err) {
        console.error("❌ Refresh token thất bại:", err);
        
        // Clear token và redirect
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common["Authorization"];
        
        // Notify waiting requests về failure
        onTokenRefreshed(null);
        
        // Redirect to login - có thể cần check nếu đang ở server-side
        if (typeof window !== 'undefined') {
          window.location.href = "/register";
        }
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;