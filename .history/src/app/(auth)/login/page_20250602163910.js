"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Button from "@/components/ui-components/Button"
import MotionContainer from "@/components/ui-components/MotionContainer"
import AuthLayout from "@/components/AuthLayout"
import axios from "axios"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifyMessage, setVerifyMessage] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const emailParam = searchParams.get("email")
      const codeParam = searchParams.get("code")    
      if (!emailParam || !codeParam) {
        return
      }
      setVerifying(true)
      try {
        const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/v1/register/verify`, {
          email: emailParam,
          code: codeParam
        }, {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000
        })
        if(res.data.code===200){
          setVerifyMessage("✅ Xác thực email thành công! Bạn có thể đăng nhập.")
        }          
      } catch (error) {
        console.error('Email verification error:', error)
        
        let errorMessage = "Xác thực thất bại."
        
        if (error.response) {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Lỗi server (${error.response.status})`
        } else if (error.request) {
          errorMessage = "Không thể kết nối đến server. Vui lòng thử lại."
        } else {
          errorMessage = error.message || "Lỗi không xác định"
        }
        
        setVerifyMessage(`❌ Xác thực thất bại: ${errorMessage}`)
        
      } finally {
        setVerifying(false)
      }
    }
    
    verifyEmail()
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    
    if (!email || !password) {
      alert("Please fill all fields")
      return
    }
    
    setLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
        email,
        password,
      })
      if(res.data.code===200){
        if (res.data.token) {
          localStorage.setItem('token', res.data.token)
        }
        console.log(res.data);
        setMessage("✅ Đăng nhập thành công!")
      }
        
      // Reset form
      setEmail("")
      setPassword("")
      window.location.href = '/index'
      
    } catch (error) {
      setMessage(
        `❌ Đăng nhập thất bại: ${
          error.response?.data?.message || error.message || "Lỗi server"
        }`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mobileButtonText="Go to Login">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
      </div>

      <MotionContainer modeKey="login" effect="fadeUp">
        {verifyMessage && (
          <div
            className={`p-3 text-sm rounded mb-4 ${
              verifyMessage.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {verifyMessage}
          </div>
        )}

        {message && (
          <div
            className={`p-3 text-sm rounded mb-4 ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2 relative">
            <h4 className="text-sm font-medium text-muted-foreground">Password</h4>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground pr-8"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-6 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={loading} className="w-full max-w-xs text-center">
              {loading ? "Logging in..." : "Sign in"}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            <div>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                Register
              </Link>
            </div>
            <div>
              or{" "}
              <Link
                href="/forgot-password"
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </form>
      </MotionContainer>
    </AuthLayout>
  )
}