"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Eye, EyeOff, ChevronDown, ArrowDown, ArrowLeftRight } from "lucide-react"
import ThemeToggle from "@/components/ui-components/Themetoggle"
import { useTheme } from "next-themes"
import Connectimg from "@/assests/photo/Connect.jpg"
import Button from "@/components/ui-components/Button"
import { AnimatePresence, motion } from "framer-motion"
import useMeasure from "react-use-measure"
import MotionContainer from "@/components/ui-components/MotionContainer"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function AuthPage() {
  const [mode, setMode] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const formRef = useRef(null)
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const [verifyMessage, setVerifyMessage] = useState("")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
  const email = searchParams.get("email")
  const code = searchParams.get("code")

  if (email && code) {
    setVerifying(true)
    fetch("http://localhost:8080/api/v1/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
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


  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === "register" && password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    console.log(`${mode === "login" ? "Login" : mode === "register" ? "Register" : "Reset"} with:`, {
      email,
      password,
    })
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const [formBoundsRef, { height }] = useMeasure()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="fixed t-0  w-full p-2 flex justify-between items-center bg-[var(--background)] z-10">
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
      <main className="flex-grow flex flex-col md:flex-row h-full">
        {/* Left Side (Image) */}
        <div className=" w-full md:w-1/2 h-screen  flex items-center justify-center bg-muted relative">
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
                {mode === "login" ? "Sign in" : mode === "register" ? "Create your account" : "Reset Password"}
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
<AnimatePresence mode="wait">
  <MotionContainer key={mode} modeKey={mode} effect="fadeUp">
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
      {(mode === "login" || mode === "register") && (
        <>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Password</h4>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-input px-0 pr-10 py-1 focus:outline-none focus:border-primary text-foreground"
                required
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Confirm Password</h4>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
                required
              />
            </div>
          )}
        </>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:opacity-90 font-medium py-3 rounded-md transition-opacity"
      >
        {mode === "login"
          ? "Sign in"
          : mode === "register"
          ? "Register"
          : "Send reset link"}
      </Button>
    </form>
  </MotionContainer>
</AnimatePresence>

                </AnimatePresence>
              </div>
            </motion.div>

            {/* Bottom Links */}
            <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
              {mode === "login" && (
                <>
                  <div>
                    Don’t have an account?{" "}
                    <button
                      onClick={() => setMode("register")}
                      className="text-blue-500 dark:text-blue-400 hover:underline"
                    >
                      Register
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setMode("forgot")}
                      className="text-blue-500 dark:text-blue-400 hover:underline"
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
                  >
                    Back to Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
