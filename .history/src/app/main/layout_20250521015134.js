"use client"

import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  const headerHeight = 64

  return (
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Fixed Header */}
      <div className="h-[64px] shrink-0">
        <Header />
      </div>

      {/* Body layout */}
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        {/* Sidebar - 10% */}
        <div className="hidden md:flex md:w-[10%] sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden">
          <Sidebar />
        </div>

        {/* Main Content - 50% scrollable */}
        <main className="w-full md:w-[50%] overflow-y-auto h-full px-4 space-y-6">
          {children}
        </main>

        {/* Subcontent - 30% fixed area */}
        <aside className="hidden md:flex md:w-[30%] sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden px-4">
          <div className="border rounded-xl w-full h-full overflow-auto">
            <div className="p-4">
              <p>Subcontent area</p>
            </div>
          </div>
        </aside>

        {/* Quick Chat - 10% sticky bottom */}
        <div className="hidden md:flex md:w-[10%] sticky top-[64px] h-[calc(100vh-64px)] items-end justify-center">
          <div className="mb-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
            💬
          </div>
        </div>
      </div>
    </div>
  )
}
