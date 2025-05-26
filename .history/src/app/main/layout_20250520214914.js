// src/app/(main)/layout.js
"use client"

import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  const headerHeight = "64px" // hoặc tuỳ chỉnh nếu Header của bạn cao hơn

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full" style={{ height: headerHeight }}>
        <Header />
      </header>

      {/* Body content */}
      <div className="flex">
        {/* Sidebar cố định bên trái và canh giữa dọc */}
        <aside
          className="hidden md:flex w-64 justify-center sticky top-0 h-[calc(100vh-64px)]"
          style={{ marginTop: headerHeight }}
        >
          <div className="flex flex-col justify-center w-full">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 p-4 md:p-6 lg:p-8"
          style={{ marginTop: headerHeight }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
