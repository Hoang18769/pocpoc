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

// Danh sách các endpoint không cần token
const PUBLIC_ENDPOINTS = [
  '/v1/auth/login',
  '/v1/auth/register', 
  '/v1/auth/forgot-password',
  '/v1/auth/reset-password',
  '/v1/auth/verify-email',
  '/v1/auth/refresh', // Thêm refresh endpoint vào public
];

// Hàm kiểm tra có phải endpoint public không
function isPublicEndpoint(url) {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

// Interceptor thêm access token vào request
api.interceptors.request.use(
  (config) => {
    try {
      // Kiểm tra nếu là public endpoint hoặc có flag skipAuth
      if (isPublicEndpoint(config.url) || config.skipAuth) {
        console.log("🔓 Endpoint public hoặc skip auth, bỏ qua token:", config.url);
        return config;
      }

      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔐 Thêm access token vào request:", config.url);
      } else {
        console.warn("⚠️ Không có token cho endpoint cần bảo mật:", config.url);
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

    // Chỉ xử lý lỗi 401 và không phải public endpoint
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(originalRequest.url) &&
      !originalRequest.skipAuth
    ) {
      console.warn("🚫 Nhận lỗi 401 - accessToken có thể đã hết hạn");
      console.log("📍 URL gây lỗi 401:", originalRequest.url);
      console.log("🔍 Token hiện tại:", localStorage.getItem("accessToken"));

      originalRequest._retry = true;

      if (isRefreshing) {
        console.log("⏳ Đang refresh - đợi token mới...");
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              console.log("🔁 Gửi lại request với token mới sau khi chờ:", originalRequest.url);
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
        // Sử dụng axios instance riêng để tránh interceptor
        const refreshInstance = axios.create({
          baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
          withCredentials: true,
          timeout: 10000
        });

        const refreshRes = await refreshInstance.post('/v1/auth/refresh', {});

        const newToken = refreshRes?.data?.body?.token;

        if (newToken) {
          console.log("✅ Refresh token thành công, lưu token mới");
          localStorage.setItem("accessToken", newToken);
          
          // Cập nhật default header cho tất cả request sau này
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
        console.error("❌ Refresh response:", err.response?.data);
        
        // Clear token và redirect
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common["Authorization"];
        
        // Notify waiting requests về failure
        onTokenRefreshed(null);
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          console.log("🔄 Redirect to login page");
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

// Hàm để set token sau khi login thành công
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("✅ Đã set token mới cho tất cả request:", token);
  } else {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    console.log("🗑️ Đã xóa token");
  }
}

// Hàm để lấy token hiện tại
export function getAuthToken() {
  return localStorage.getItem("accessToken");
}

export default api;