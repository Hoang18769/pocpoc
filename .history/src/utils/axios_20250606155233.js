import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
  timeout: 30000, // Tăng timeout
});
// api.defaults.headers.common['Content-Type'] = 'application/json';
// api.defaults.headers.post['Content-Type'] = 'application/json';
// api.defaults.headers.put['Content-Type'] = 'application/json';
// api.defaults.headers.patch['Content-Type'] = 'application/json';
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  console.log(" Gọi lại các request bị chờ sau khi refresh:", newToken);
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
  '/v1/forgot-password',
  '/v1/update-password',
  '/v1/auth/verify-email',
  '/v1/auth/refresh',
];

// Hàm kiểm tra có phải endpoint public không - FIX: Cải thiện logic kiểm tra
function isPublicEndpoint(url) {
  if (!url) return false;
  
  // Lấy pathname từ URL, bỏ qua query parameters
  const pathname = url.split('?')[0];
  
  return PUBLIC_ENDPOINTS.some(endpoint => {
    return pathname.includes(endpoint) || pathname.endsWith(endpoint);
  });
}

// Interceptor thêm access token vào request
api.interceptors.request.use(
  (config) => {
    try {
            if (isPublicEndpoint(config.url) || config.skipAuth) {
        console.log(" Endpoint public hoặc skip auth, bỏ qua token:", config.url);
        return config;
      }

      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(" Thêm access token vào request:", config.url);
      } else {
        console.warn(" Không có token cho endpoint cần bảo mật:", config.url);
      }
    } catch (err) {
      console.warn(" Lỗi khi đọc accessToken từ localStorage:", err);
    }
    return config;
  },
  (error) => {
    console.error(" Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi 401 và tự động refresh - FIXED VERSION
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.log(" Response interceptor triggered:", error, error?.config?.url);    
    
    const originalRequest = error.config;

    // Network error nhưng có thể là 401
    if (!error.response) {
      console.error("error", error);
      if (
        error.code === 'ERR_NETWORK' &&
        !originalRequest._retry &&
        !isPublicEndpoint(originalRequest?.url) &&
        !originalRequest.skipAuth &&
        localStorage.getItem("accessToken") // Chỉ thử nếu có token
      ) {
        console.warn(" Network error có thể do token hết hạn, thử refresh...");
        originalRequest._retry = true;
        
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((newToken) => {
              if (newToken) {
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                resolve(api(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }
        isRefreshing = true;
        
        try {
          const refreshInstance = axios.create({
            baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
            withCredentials: true,
            timeout: 15000
          });

          const refreshRes = await refreshInstance.post('/v1/auth/refresh', {});
          const newToken = refreshRes?.data?.body?.token;

          if (newToken) {
            console.log(" Network error -> Refresh thành công");
            localStorage.setItem("accessToken", newToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;  
            onTokenRefreshed(newToken);
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error(" Network error -> Refresh thất bại:", refreshError);
          localStorage.removeItem("accessToken");
          delete api.defaults.headers.common["Authorization"];
          onTokenRefreshed(null);
          
          if (typeof window !== 'undefined') {
            setTimeout(() => window.location.href = "/register", 100);
          }
        } finally {
          isRefreshing = false;
        }
      }
      
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = originalRequest?.url || '';

    // FIX: Cải thiện điều kiện kiểm tra 401
    const shouldRefresh = (
      status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(requestUrl) &&
      !originalRequest.skipAuth &&
      originalRequest.url !== '/v1/auth/refresh' // Tránh loop vô hạn
    );

    if (shouldRefresh) {
      console.warn(" Nhận lỗi 401 - accessToken có thể đã hết hạn");
      console.log(" URL gây lỗi 401:", requestUrl);
      console.log(" Token hiện tại:", localStorage.getItem("accessToken")?.substring(0, 20) + "...");

      originalRequest._retry = true;

      // FIX: Cải thiện logic xử lý đồng thời nhiều request
      if (isRefreshing) {
        console.log(" Đang refresh - đợi token mới...");
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              console.log(" Gửi lại request với token mới sau khi chờ:", requestUrl);
              resolve(api(originalRequest));
            } else {
              console.error(" Không nhận được token mới từ refresh subscriber");
              reject(new Error("Failed to get new token"));
            }
          });
        });
      }

      isRefreshing = true;
      console.log(" Bắt đầu gọi API refresh token...");

      try {
        // FIX: Sử dụng axios instance riêng với config rõ ràng hơn
        const refreshInstance = axios.create({
          baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(" Calling refresh endpoint...");
        const refreshRes = await refreshInstance.post('/v1/auth/refresh', {});
        
        console.log(" Refresh response received:", refreshRes.status);
        const newToken = refreshRes?.data?.body?.token;

        if (newToken && newToken.length > 0) {
          console.log(" Refresh token thành công, lưu token mới");
          localStorage.setItem("accessToken", newToken);
          
          // Cập nhật default header cho tất cả request sau này
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          
          // Cập nhật token cho original request
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          
          // Thông báo cho các request đang chờ
          onTokenRefreshed(newToken);
          
          console.log(" Gửi lại original request với token mới:", requestUrl);
          return api(originalRequest);
        } else {
          throw new Error(" Không tìm thấy access token trong phản hồi refresh.");
        }
      } catch (refreshError) {
        console.error(" Refresh token thất bại:", refreshError);
        console.error(" Refresh response:", refreshError.response?.data);
        console.error(" Refresh status:", refreshError.response?.status);
        
        // Clear token và redirect
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common["Authorization"];
        
        // Notify waiting requests về failure
        onTokenRefreshed(null);
        
        // FIX: Redirect to login với error handling tốt hơn
        if (typeof window !== 'undefined') {
          console.log(" Redirect to login page");
          // Delay một chút để tránh race condition
          setTimeout(() => {
            window.location.href = "/register";
          }, 100);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log(" Refresh process completed");
      }
    }

    console.log(" Reject error:", status, requestUrl);
    return Promise.reject(error);
  }
);

// Hàm để set token sau khi login thành công
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(" Đã set token mới cho tất cả request");
  } else {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    console.log(" Đã xóa token");
  }
}

// Hàm để lấy token hiện tại
export function getAuthToken() {
  return localStorage.getItem("accessToken");
}

// FIX: Thêm function để check token validity
export function isTokenValid() {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  
  try {
    // Kiểm tra format JWT cơ bản
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload để check exp (nếu cần)
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp ? payload.exp > now : true;
  } catch (error) {
    console.warn(" Error checking token validity:", error);
    return false;
  }
}

export default api;