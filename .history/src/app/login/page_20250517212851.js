"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, ChevronDown, ArrowDown } from "lucide-react"
import ThemeToggle from "@/components/ui-components/Themetoggle"
import { useTheme } from "next-themes"
import Connectimg from "@/assests/photo/Connect.jpg"
import style from "@/styles/home.module.css"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const formRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login attempt with:", { email, password })
    // Xử lý đăng nhập ở đây
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // For debugging
  useEffect(() => {
    if (mounted) {
      console.log("Login page theme:", theme)
    }
  }, [theme, mounted])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center bg-background">
        <div className="font-bold text-2xl">pocpoc</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>English (UK)</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          {/* <ThemeToggle /> */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left Side - Network Illustration (Full screen on mobile) */}
        <div className="w-full md:w-1/2 h-screen md:h-auto relative flex items-center justify-center bg-muted">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Image
src={Connectimg}
              alt="Network illustration"
              width={500}
              height={500}
              className="max-w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Mobile-only "Go to sign in" button */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center md:hidden">
            <button
              onClick={scrollToForm}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
            >
              Go to sign in
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side - Login Form (Below on mobile) */}
        <div ref={formRef} className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-background">
          <div  className=` {style}w-full max-w-md  text-card-foreground rounded-xl p-8 shadow-xl`>
            <h1 className="text-2xl font-bold mb-6">Sign in</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-input rounded-none px-0 py-1 focus:outline-none focus:border-primary text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Password</h4>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-input rounded-none px-0 pr-10 py-1 focus:outline-none focus:border-primary text-foreground"
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

              <button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground hover:opacity-90 font-medium py-3 rounded-md transition-opacity"
              >
                Sign in
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/register" className="text-blue-500 dark:text-blue-400 hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
