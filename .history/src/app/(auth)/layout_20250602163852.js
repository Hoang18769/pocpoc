"use client"

import { useRef } from "react"
import Image from "next/image"
import { ArrowDown } from "lucide-react"
import { useTheme } from "next-themes"
import Connectimg from "@/assests/photo/Connect.jpg"

export default function AuthLayout({ 
  children, 
  title = "Auth",
  mobileButtonText = "Get Started" 
}) {
  const formRef = useRef(null)
  const { theme } = useTheme()

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Section */}
      <main className="flex-grow flex flex-col md:flex-row h-full">
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
              {mobileButtonText}
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div
          ref={formRef}
          className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-background"
        >
          <div className="w-full max-w-md text-card-foreground rounded-xl p-8 shadow-xl bg-[var(--card)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}