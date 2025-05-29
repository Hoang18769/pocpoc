"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import MotionContainer from "@/components/ui-components/MotionContainer"
import Chatbox from "@/components/social-app-component/ChatBox"
import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"
import ProgressBar from "@/components/ui-components/ProgressBar"

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()
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

  const hideRightSidebar =
    pathname.startsWith("/settings") || pathname.startsWith("/search")

  const layoutContent = (
    <>
    <ProgressBar />
    <div className="h-screen flex flex-col">
      {/* Header cố định */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b transition-colors duration-500">
        <Header />
      </div>

      {/* Body: Sidebar + Main + Right */}
      <div className="flex flex-1 pt-16 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        
        {/* Sidebar trái */}
        <aside className="md:w-[80px] h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Nội dung chính */}
        <main className="flex-1 flex justify-center h-[calc(100vh-64px)] overflow-y-auto px-4">
          <div className="w-full space-y-6">
            {children}
          </div>
        </main>

        {/* Sidebar phải */}
        <aside
          className={`p-8 hidden md:flex ${
            hideRightSidebar ? "w-[80px] "  : "border w-[80px] lg:w-[400px] lg:max-w-[400px]"
          } h-[calc(100vh-64px)]  items-end justify-center`}
        >
          {!hideRightSidebar && <div 
            <Chatbox />
          </div>}
        </aside>
      </div>
    </div>
    </>
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
