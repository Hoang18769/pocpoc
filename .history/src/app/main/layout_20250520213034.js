// src/app/(main)/layout.js
"use client"

import Header
import Sidebar from "@/components/layout/Sidebar"

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <Header />

      {/* Sidebar + Main Content */}
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
