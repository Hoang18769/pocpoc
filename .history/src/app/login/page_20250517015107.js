"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, ChevronDown } from "lucide-react"
import connect_img from "@/assests/photo/"
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login attempt with:", { email, password })
    // Xử lý đăng nhập ở đây
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center">
        <div className="font-bold text-2xl">pocpoc</div>
        <div className="flex items-center text-sm text-gray-500">
          <span>English (UK)</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 md:p-8">
        {/* Left Side - Network Illustration */}
        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
         
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-md bg-gray-100 rounded-xl p-8">
            <h1 className="text-2xl font-bold mb-6">Sign in</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Email</h4>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 rounded-none px-0 py-1 focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Password</h4>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-300 rounded-none px-0 pr-10 py-1 focus:outline-none focus:border-black"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-300 hover:bg-gray-400 text-black font-medium py-3 rounded-md"
              >
                Sign in
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
