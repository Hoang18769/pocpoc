"use client"

import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header luôn cố định */}
      <Header />

      <div className="flex pt-14 md:pt-0"> {/* Thêm padding top để tránh Header đè khi mobile */}
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 mt-0 md:mt-[64px]">{children}</main>
      </div>
    </div>
  )
}
