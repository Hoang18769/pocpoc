"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence } from "framer-motion"
import MotionContainer from "@/components/ui-components/MotionContainer"
import Chatbox from "@/components/social-app-component/ChatBox"
import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"
import { cookies } from 'next/headers'

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const prevThemeRef = useRef(null)
  

  useEffect(() => {
    setMounted(true)
  }, [])

  const shouldAnimate = mounted && prevThemeRef.current && prevThemeRef.current !== resolvedTheme

  // Lưu lại theme cũ để lần sau so sánh
  useEffect(() => {
    if (mounted) {
      prevThemeRef.current = resolvedTheme
    }
  }, [resolvedTheme, mounted])

  const layoutContent = (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b transition-colors duration-500">
        <Header />
      </div>

      {/* Body */}
      <div className="flex flex-1 pt-16 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <div className="md:flex h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </div>
        <main className="w-full md:w-[60%] overflow-y-auto h-[calc(100vh-64px)] px-2 sm:px-3 space-y-6">
          {children}
        </main>
        <aside className="hidden md:flex md:w-[30%] sticky top-16 h-[calc(100vh-64px)] overflow-hidden">
          <div className="border rounded-xl w-full h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4" />
            <Chatbox />
          </div>
        </aside>
        <div className="hidden md:flex md:w-[10%] sticky top-16 h-[calc(100vh-64px)] items-end justify-center">
          <div className="mb-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
            💬
          </div>
        </div>
      </div>
    </div>
  )

  return shouldAnimate ? (
    <AnimatePresence mode="wait">
      <MotionContainer
        key={resolvedTheme}
        modeKey={resolvedTheme}
        effect="fadeUp"
        duration={0.25}
      >
        {layoutContent}
      </MotionContainer>
    </AnimatePresence>
  ) : (
    layoutContent
  )
}
