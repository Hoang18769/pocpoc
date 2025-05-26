// src/app/(main)/layout.js
"use client"

import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  const headerHeight = "64px" // hoặc tuỳ chỉnh nếu Header của bạn cao hơn

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="flex">
        <SidebarNavigation />
        <main className="flex-1 p-4 md:p-6 lg:p-8 mt-0 md:mt-[64px]">{children}</main>
      </div>
    </div>
  )
}
