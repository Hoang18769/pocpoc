"use client"

import { useState } from "react"
import Chatbox from "@/components/social-app-component/ChatBox"
import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"
import ThemeToggle from "@/components/ui-components/Themetoggle"

export default function MainLayout({ children }) {
  const [showSubcontent, setShowSubcontent] = useState(false)

  return (
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b">
        <Header />
      </div>

      {/* Body layout */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div className="md:flex border h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="relative w-full md:w-[60%] overflow-y-auto h-[calc(100vh-64px)] px-2 sm:px-3 md:px-2 lg:px-2 space-y-6">
          {children}

          {/* Button to show subcontent modal (mobile only) */}
          <div className="fixed bottom-20 right-4 md:hidden">
            <button
              onClick={() => setShowSubcontent(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
            >
              Mở Chat
            </button>
          </div>
        </main>

        {/* Subcontent (desktop only) */}
        <aside className="md:flex md:w-[30%] justify-end sticky top-16 h-[calc(100vh-64px)] overflow-hidden px-2 sm:px-3 md:px-4 lg:px-6">
          <div className="border rounded-xl w-full h-full overflow-auto">
            <div className="p-2 sm:p-3 md:p-4">
              <Chatbox />
            </div>
          </div>
        </aside>

        

      {/* Subcontent Modal (mobile only) */}
      {showSubcontent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center md:hidden">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-[90%] max-h-[80vh] overflow-auto shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Chat</h2>
              <button
                onClick={() => setShowSubcontent(false)}
                className="text-gray-500 hover:text-red-500"
              >
                ✖
              </button>
            </div>
            <Chatbox />
          </div>
        </div>
      )}
    </div>
  )
}
