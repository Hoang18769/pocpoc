"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, ChevronDown, ArrowDown, ArrowLeftRight } from "lucide-react"
import ThemeToggle from "@/components/ui-components/Themetoggle"
import { useTheme } from "next-themes"
import Connectimg from "@/assests/photo/Connect.jpg"
import Button from "@/components/ui-components/Button"
import { AnimatePresence, motion } from "framer-motion"
import useMeasure from "react-use-measure"
import MotionContainer from "@/components/ui-components/MotionContainer"
import axios from "axios"

export default function AuthPage() {
  const [mode, setMode] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [givenName, setGivenName] = useState("")
  const [familyName, setFamilyName] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const formRef = useRef(null)
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifyMessage, setVerifyMessage] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const codeParam = searchParams.get("code")
    if (emailParam && codeParam) {
      setVerifying(true)
      fetch("http://localhost:80/v1/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, code: codeParam }),
      })
        .then(async (res) => {
          const result = await res.json()
          if (res.ok) {
            setVerifyMessage("✅ Xác thực email thành công! Bạn có thể đăng nhập.")
          } else {
            throw new Error(result.message || "Xác thực thất bại.")
          }
        })
        .catch((err) => {
          setVerifyMessage(`❌ Xác thực thất bại: ${err.message}`)
        })
        .finally(() => {
          setVerifying(false)
        })
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    if (mode === "register") {
      if (password !== confirmPassword) {
        alert("Passwords do not match!")
        return
      }
      if (!givenName || !familyName || !birthdate) {
        alert("Please fill all fields")
        return
      }
      setLoading(true)
      try {
        const res = await axios.post("http://localhost:80/v1/register", {
          email,
          password,
          givenName,
          familyName,
          birthdate,
        })
        setMessage("✅ Đăng ký thành công! Vui lòng kiểm tra email để xác thực.")
        setMode("login")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setGivenName("")
        setFamilyName("")
        setBirthdate("")
      } catch (error) {
        setMessage(
          `❌ Đăng ký thất bại: ${
            error.response?.data?.message || error.message || "Lỗi server"
          }`
        )
      } finally {
        setLoading(false)
      }
    } else if (mode === "login") {
      // Xử lý login nếu cần
    } else if (mode === "forgot") {
      // Xử lý quên mật khẩu nếu cần
    }
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const [formBoundsRef, { height }] = useMeasure()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full p-2 flex justify-between items-center bg-[var(--background)] z-10">
        <div className="font-bold text-2xl">pocpoc</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>English (UK)</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-grow flex flex-col md:flex-row h-full pt-14">
        {/* Left Side (Image) */}
        <div className="w-full md:w-1/2 h-screen flex items-center justify-center bg-muted relative">
          <Image
            src={Connectimg}
            alt="Network illustration"
            width={400}
            height={400}
            className="max-w-full h-auto object-contain"
            priority
          />
          {/* Mobile button */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center md:hidden">
            <button
              onClick={scrollToForm}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
            >
              Go to {mode}
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div
          ref={formRef}
          className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-background"
        >
          <div
            className="w-full max-w-md text-card-foreground rounded-xl p-8 shadow-xl bg-[var(--card)]"
            style={{ overflow: "hidden" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {mode === "login"
                  ? "Sign in"
                  : mode === "register"
                  ? "Create your account"
                  : "Reset Password"}
              </h1>
              {mode !== "forgot" && (
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  <ArrowLeftRight className="inline-block w-4 h-4 mr-1" />
                  {mode === "login" ? "Register" : "Sign in"}
                </button>
              )}
            </div>

            <motion.div
              animate={{ height }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div ref={formBoundsRef}>
                <AnimatePresence mode="wait">
                  <MotionContainer key={mode} modeKey={mode} effect="fadeUp">
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

                      {/* Register mode extra fields */}
                      <div></div>
                      {mode === "register" && (
                        <>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Given Name
                            </h4>
                            <input
                              type="text"
                              value={givenName}
                              onChange={(e) => setGivenName(e.target.value)}
                              className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Family Name
                            </h4>
                            <input
                              type="text"
                              value={familyName}
                              onChange={(e) => setFamilyName(e.target.value)}
                              className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Birthdate
                            </h4>
                            <input
                              type="date"
                              value={birthdate}
                              onChange={(e) => setBirthdate(e.target.value)}
                              className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
                              required
                            />
                          </div>
                        </>
                      )}

                      {/* Password (ẩn khi mode = forgot) */}
                      {mode !== "forgot" && (
                        <div className="space-y-2 relative">
                          <h4 className="text-sm font-medium text-muted-foreground">Password</h4>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground pr-8"
                            required={mode !== "forgot"}
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
                      )}

                      {/* Confirm password for register */}
                      {mode === "register" && (
                        <div className="space-y-2 relative">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Confirm Password
                          </h4>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground pr-8"
                            required
                          />
                        </div>
                      )}

                      {/* Nút submit căn giữa */}
                      <div className="flex justify-center">
                        <Button type="submit" disabled={loading} className="w-full max-w-xs text-center">
                          {loading
                            ? mode === "register"
                              ? "Registering..."
                              : mode === "forgot"
                              ? "Sending..."
                              : "Logging in..."
                            : mode === "register"
                            ? "Register"
                            : mode === "forgot"
                            ? "Send Reset Link"
                            : "Sign in"}
                        </Button>
                      </div>

                      <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
                        {mode === "login" && (
                          <>
                            <div>
                              Don’t have an account?{" "}
                              <button
                                onClick={() => setMode("register")}
                                className="text-blue-500 dark:text-blue-400 hover:underline"
                                type="button"
                              >
                                Register
                              </button>
                            </div>
                            <div>
                              or{" "}
                              <button
                                onClick={() => setMode("forgot")}
                                className="text-blue-500 dark:text-blue-400 hover:underline"
                                type="button"
                              >
                                Forgot password?
                              </button>
                            </div>
                          </>
                        )}

                        {mode === "register" && (
                          <div>
                            Already have an account?{" "}
                            <button
                              onClick={() => setMode("login")}
                              className="text-blue-500 dark:text-blue-400 hover:underline"
                              type="button"
                            >
                              Sign in
                            </button>
                          </div>
                        )}

                        {mode === "forgot" && (
                          <div>
                            Remembered?{" "}
                            <button
                              onClick={() => setMode("login")}
                              className="text-blue-500 dark:text-blue-400 hover:underline"
                              type="button"
                            >
                              Back to Sign in
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  </MotionContainer>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
