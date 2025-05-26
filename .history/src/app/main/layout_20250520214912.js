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
        <aside className="md:sticky md:top-[64px] md:h-[calc(100vh-64px)]">
  {/* Desktop sidebar */}
  <div className="hidden md:flex w-64 flex-col justify-center">
    <Sidebar />
  </div>

  {/* Mobile bottom bar */}
  <div className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--background)] border-t border-gray-200 dark:border-gray-700 z-50">
    <Sidebar mobile />
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
