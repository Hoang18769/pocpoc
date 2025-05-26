"use client"

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
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b transition-colors duration-500">
        <Header />
      </div>

      {/* Animate only the theme-sensitive area */}
      <AnimatePresence mode="wait">
        <MotionContainer
          key={resolvedTheme}
          modeKey={resolvedTheme}
          effect="fadeUp" // Hoặc "scaleY", "zoom"...
          duration={0.25}
        >
          <div className="flex flex-1 pt-16 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
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
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4"></div>
                <Chatbox />
              </div>
            </aside>

            {/* Quick Chat */}
            <div className="hidden md:flex md:w-[10%] sticky top-16 h-[calc(100vh-64px)] items-end justify-center">
              <div className="mb-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
                💬
              </div>
            </div>
          </div>
        </MotionContainer>
      </AnimatePresence>
    </div>
  )
}
