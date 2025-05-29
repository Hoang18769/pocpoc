"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence } from "framer-motion"
import MotionContainer from "@/components/ui-components/MotionContainer"
import Chatbox from "@/components/social-app-component/ChatBox"
import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const prevThemeRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shouldAnimate = mounted && prevThemeRef.current && prevThemeRef.current !== resolvedTheme

  useEffect(() => {
    if (mounted) {
      prevThemeRef.current = resolvedTheme
    }
  }, [resolvedTheme, mounted])

  const layoutContent = (
    <div className="h-screen flex flex-col">
      {/* Header cố định */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b transition-colors duration-500">
        <Header />
      </div>

      {/* Body: Sidebar + Main + Right */}
      <div className="flex flex-1 pt-16 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        
        {/* Sidebar trái */}
        <aside className=" md:w-[80px] h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Nội dung chính (căn giữa) */}
        <main className="flex-1 flex justify-center h-[calc(100vh-64px)] overflow-y-auto px-4">
          <div className="w-full space-y-6">
            {children}
          </div>
        </main>

        {/* Nút chat bên phải */}
        <aside className="hidden md:flex w-[80px] lg:w-[400px] lg:max-w-[400px] h-[calc(100vh-64px)] items-end justify-end">
            {/* <Chatbox/> */}
          <div className="m-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
            💬
          </div>
        </aside>
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
