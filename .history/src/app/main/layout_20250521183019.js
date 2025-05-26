"use client"

import Chatbox from "@/components/social-app-component/ChatBox"
import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"
import ThemeToggle from "@/components/ui-components/Themetoggle"

export default function MainLayout({ children }) {
  return (
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col ">
      {/* Fixed Header */}
      <div className="fixed  top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b">
        <Header />
      </div>

      {/* Body layout - đẩy xuống đúng chiều cao header */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar*/}
        <div className="md:flex  h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </div>
        {/* <div className=" md:hidden border md:flex sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </div> */}

        {/* Main Content - 50% scrollable */}
        <main className="w-full md:w-[60%] overflow-y-auto h-[calc(100vh-64px)] px-2 sm:px-3 md:px-4 lg:px-6 space-y-6">
          {children}
        </main>

        {/* Subcontent - 30% fixed area */}
        <aside className="hidden md:flex md:w-[30%] sticky top-16 h-[calc(100vh-64px)] overflow-hidden px-2 sm:px-3 md:px-4 lg:px-6">
          <div className="border rounded-xl w-full h-full overflow-auto">
            <div className="p-2 sm:p-3 md:p-4">
              {/* <Chatbox /> */}
            </div>
          </div>
        </aside>

        {/* Quick Chat - 10% sticky bottom */}
        <div className="hidden md:flex md:w-[10%] sticky top-16 h-[calc(100vh-64px)] items-end justify-center">
          <div className="mb-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
            💬
          </div>
        </div>
      </div>
    </div>
  )
}
