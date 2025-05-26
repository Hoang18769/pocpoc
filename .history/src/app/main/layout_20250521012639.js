"use client"

import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  const headerHeight = "64px"

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="flex flex-col md:flex-row ">
        {/* Sidebar - 10% */}
        <div className="hidden md:block md:w-[10%] p-2 sticky t-0 b-0">
          <Sidebar />
        </div>

        {/* Main Content - 50% */}
        <main className="w-full md:w-[50%] p-4 space-y-6">
          {children}
        </main>

        {/* Subcontent - 30% */}
        <aside className="hidden md:block md:w-[30%] p-4">
          {/* Bạn có thể truyền props hoặc thêm content phụ tại đây */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 h-[]>
            <p className="text-sm text-gray-500 dark:text-gray-300">Subcontent area</p>
          </div>
        </aside>

        {/* Quick Chat - 10% */}
        <div className="hidden md:flex md:w-[10%] p-2 items-end justify-center">
          <div className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer">
            💬
          </div>
        </div>
      </div>
    </div>
  )
}
