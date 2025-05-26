"use client"

import Chatbox from "@/components/social-app-component/ChatBox"
import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"
import ThemeToggle from "@/components/ui-components/Themetoggle"

export default function MainLayout({ children }) {
  const headerHeight = 64

  return (
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b">
        <Header />
      </div>

      {/* Body layout - đẩy xuống 64px */}
      <div className="flex flex-1 pt-[64px]">
        {/* Sidebar lớn (bên trái) chỉ hiện ở md+ */}
        <div className="min-w-50 hidden md:flex md:w-[8%] sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden">
          <Sidebar />
        </div>

        {/* Sidebar nhỏ (dưới cùng) chỉ hiện ở dưới md */}
        <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border-t md:hidden z-50">
          <div className="w-full h-16 flex items-center justify-center">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="w-full md:w-[50%] overflow-y-auto h-[calc(100vh-64px)] px-4 space-y-6">
          {children}
        </main>

        {/* Subcontent */}
        <aside className="hidden md:flex md:w-[30%] sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden px-4">
          <div className="border rounded-xl w-full h-full overflow-auto">
            <div className="p-4">
              <Chatbox />
            </div>
          </div>
        </aside>

        {/* Quick Chat */}
        <div className="hidden md:flex md:w-[10%] sticky top-[64px] h-[calc(100vh-64px)] items-end justify-center">
          <div className="mb-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
            💬
          </div>
        </div>
      </div>
    </div>
  )
}
