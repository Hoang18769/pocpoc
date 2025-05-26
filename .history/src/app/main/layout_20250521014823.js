"use client"

import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  const headerHeight = 64

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Fixed Header */}
      <Header />

      {/* Body layout */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - 10% */}
        <div className="hidden md:flex md:w-[10%] sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden">
          <Sidebar />
        </div>

        {/* Main Content - 50% scrollable */}
        <main className="w-full md:w-[50%] overflow-y-auto h-[calc(100vh-64px)] p-4 space-y-6">
          {children}
        </main>

        {/* Subcontent - 30% fixed area */}
        <aside className="hidden md:flex md:w-[30%] h-[calc(100vh-64px)] sticky top-[64px] p-4 overflow-hidden">
          <div className="border rounded-xl p-4 w-full h-full overflow-auto">
            <p className="">Subcontent area</p>
          </div>
        </aside>

        {/* Quick Chat - 10% sticky bottom */}
        <div className="hidden md:flex md:w-[10%] p-2 items-end justify-center h-[calc(100vh-64px)] sticky top-[64px]">
          <div className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
            💬
          </div>
        </div>
      </div>
    </div>
  )
}
