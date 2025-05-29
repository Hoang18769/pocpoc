"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function PageTransitionSkeleton() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 500) // giữ skeleton tối thiểu 0.5s để tránh nháy

    return () => clearTimeout(timeout)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="space-y-4 w-full max-w-xl px-6">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        <div className="h-52 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse w-full" />
      </div>
    </div>
  )
}
