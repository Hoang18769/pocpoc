"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Shield, ArrowLeftRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import api, { clearSession } from "@/utils/axios";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Hàm parse lỗi tái sử dụng
  const parseApiError = (error) => {
    if (error?.response) {
      return (
        error.response.data?.message ||
        error.response.data?.error ||
        `Lỗi server (${error.response.status})`
      );
    } else if (error?.request) {
      return "Không thể kết nối đến server. Vui lòng thử lại.";
    } else {
      return error.message || "Lỗi không xác định";
    }
  };
  const handleLogout = async () => {
  try {
    await api.delete("/v1/auth/logout");
  } catch (err) {
    console.error("Logout failed:", err.response?.data || err.message);
  } finally {
    clearSession(); // ✅ xoá localStorage + cookie + token headers

    router.push("/register");
  }
};
  const handleSubmit = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("❌ Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      // Gửi request login-admin
      const res = await api.post("/v1/auth/login-admin", {
        email: email,
        password: password,
      });

      if (res.data.code===200) {
        console.log(res)
        setMessage("✅ Đăng nhập admin thành công!");
        localStorage.setItem("accessToken", token);
        const decoded = jwtDecode(token);
        console.log(decoded);
        localStorage.setItem("userId", decoded.sub);
        localStorage.setItem("userName", decoded.username);
        setTimeout(() => {
          router.push("/admin/dashboard"); // Chuyển hướng đến trang quản trị
        }, 1200);
      } else {
        setMessage(`❌ ${res.data.message || "Đăng nhập thất bại"}`);
      }
    } catch (error) {
      setMessage(`❌ Đăng nhập thất bại: ${parseApiError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/auth"); // Quay lại trang login thường
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-6xl flex items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Admin Portal
              </h1>
              <p className="text-muted-foreground">
                Truy cập hệ thống quản trị
              </p>
              <button onClick={handleLogout}>
                logout
              </button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-md">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Enhanced Security
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Các phiên đăng nhập admin được mã hóa và tự động hết hạn để
                    tăng cường bảo mật.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="w-full max-w-md">
            <div className="bg-card rounded-xl p-8 shadow-xl border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-card-foreground">
                  Admin Login
                </h2>
                <button
                  onClick={handleBackToLogin}
                  className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Back to Login
                </button>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Restricted Access - Administrators Only
                  </span>
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 text-sm rounded-lg mb-6 ${
                    message.includes("✅")
                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Admin Email
                  </h4>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-input px-0 py-2 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2 relative">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Admin Password
                  </h4>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-input px-0 py-2 pr-10 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                    placeholder="Enter admin password"
                    required
                    minLength={6}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-8 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Authenticating...
                    </div>
                  ) : (
                    "Access Admin Panel"
                  )}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="bg-accent rounded-lg p-4">
                  <p className="text-sm font-medium text-accent-foreground mb-2">
                    Demo Credentials:
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Email: admin@example.com</p>
                    <p>Password: admin123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
