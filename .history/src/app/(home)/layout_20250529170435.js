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
  <div className="flex flex-1 pt-16 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 overflow-hidden">
    
    {/* Sidebar trái - giữ nguyên chiều cao, không cuộn */}
    <aside className="md:w-[80px] h-full sticky top-16 overflow-hidden">
      <Sidebar />
    </aside>

    {/* Nội dung chính - cuộn toàn bộ trong khung này */}
    <main className="flex-1 flex justify-center h-full overflow-y-auto px-4">
      <div className="w-full space-y-6 py-4">
        {children}
      </div>
    </main>

    {/* Sidebar phải - giữ nguyên chiều cao, không bị cuộn theo main */}
    <aside
      className={`p-8 hidden md:flex ${
        hideRightSidebar ? "w-[80px]" : "w-[80px] lg:w-[400px] lg:max-w-[400px]"
      } h-full sticky top-16 items-end justify-center overflow-hidden`}
    >
      {!hideRightSidebar && <Chatbox />}
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
