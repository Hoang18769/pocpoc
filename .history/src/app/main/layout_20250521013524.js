"use client"

import Header from "@/components/ui-components/Header"
import Sidebar from "@/components/ui-components/Sidebar"

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="flex flex-col md:flex-row md:mt-[64px]">
        {/* Sidebar - 10% */}
        <div className="hidden md:block md:w-[10%]">
          <Sidebar />
        </div>

        {/* Main Content - 50% */}
        <main className="w-full md:w-[50%] p-4 space-y-6">
          {children}
        </main>

        {/* Subcontent - 30% */}
        <aside className="hidden md:block md:w-[30%] px-4 pt-4">
          <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Subcontent sticky bottom
            </p>
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
