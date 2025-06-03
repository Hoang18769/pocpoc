// utils/axios.js
import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
})

// Token refresh logic
let isRefreshing = false
let refreshSubscribers = []

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

// Request interceptor (add token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

// Response interceptor (handle 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔁 Token expired, trying to refresh...")

      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const res = await axios.post("/v1/auth/refresh", {}, { withCredentials: true })
          const newToken = res.data.token
          console.log("✅ Token refreshed:", newToken)

          localStorage.setItem("token", newToken)
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
          onRefreshed(newToken)
        } catch (refreshError) {
          console.error("❌ Refresh failed:", refreshError)
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`
          resolve(api(originalRequest))
        })
      })
    }

    return Promise.reject(error)
  }
)

export default api
