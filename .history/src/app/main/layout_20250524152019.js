'use client'

import Chatbox from "@/components/social-app-component/ChatBox"
import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"
import ThemeToggle from "@/components/ui-components/Themetoggle"
import MotionContainer from "@/components/ui-components/MotionContainer"
import { useTheme } from "next-themes"
import { AnimatePresence } from "framer-motion"

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme()

  return (
    <AnimatePresence mode="wait">
      <MotionContainer
        key={resolvedTheme}
        modeKey={resolvedTheme}
        effect="fade" // hoặc "zoom", "fadeDown", "scaleY" tùy style bạn thích
        duration={0.2}
        transition: { duration, ease: "easeInOut" }

      >
        <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col transition-colors duration-500">
          {/* Fixed Header */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b transition-colors duration-500">
            <Header />
          </div>

          {/* Body layout */}
          <div className="flex flex-1 pt-16">
            {/* Sidebar */}
            <div className="md:flex h-[calc(100vh-64px)] overflow-y-auto">
              <Sidebar />
            </div>

            {/* Main Content */}
            <main className="w-full md:w-[60%] overflow-y-auto h-[calc(100vh-64px)] px-2 sm:px-3 md:px-2 lg:px-2 space-y-6">
              {children}
            </main>

            {/* Aside */}
            <aside className="hidden md:flex md:w-[30%] sticky top-16 h-[calc(100vh-64px)] overflow-hidden">
              <div className="border rounded-xl w-full h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4">
                  {/* Bổ sung nội dung aside nếu có */}
                </div>
                <Chatbox />
              </div>
            </aside>

            {/* Quick Chat Icon */}
            <div className="hidden md:flex md:w-[10%] sticky top-16 h-[calc(100vh-64px)] items-end justify-center">
              <div className="mb-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
                💬
              </div>
            </div>
          </div>
        </div>
      </MotionContainer>
    </AnimatePresence>
  )
}
