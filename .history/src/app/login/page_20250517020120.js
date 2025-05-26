"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, ChevronDown, ArrowDown } from 'lucide-react'
import { ThemeProvider } from "@/providers/theme-provider"
import ThemeToggle from "@/components/theme-toggle"
import connect_img from "@/assests/photo/Connect.jpg"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const formRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login attempt with:", { email, password })
    // Xử lý đăng nhập ở đây
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
        {/* Header */}
        <header className="w-full p-6 flex justify-between items-center">
          <div className="font-bold text-2xl">pocpoc</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>English (UK)</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col md:flex-row">
          {/* Left Side - Network Illustration (Full screen on mobile) */}
          <div className="w-full md:w-1/2 h-screen md:h-auto relative flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TyvcPwnS6Uy7xNo2BU9QSN2ND0nWN0.png"
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
                className="flex items-center gap-2 bg-gray-800 dark:bg-gray-700 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Go to sign in
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Side - Login Form (Below on mobile) */}
          <div 
            ref={formRef}
            className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-white dark:bg-gray-950"
          >
            <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Sign in</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</h4>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 rounded-none px-0 py-1 focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</h4>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 rounded-none px-0 pr-10 py-1 focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-gray-100"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-3 rounded-md transition-colors"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/register" className="text-blue-500 dark:text-blue-400 hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
