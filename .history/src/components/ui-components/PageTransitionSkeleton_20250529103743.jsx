"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function PageTransitionSkeleton() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const start = () => setIsPending(true)
    const done = () => setIsPending(false)

    router.events?.on("routeChangeStart", start)
    router.events?.on("routeChangeComplete", done)
    router.events?.on("routeChangeError", done)

    return () => {
      router.events?.off("routeChangeStart", start)
      router.events?.off("routeChangeComplete", done)
      router.events?.off("routeChangeError", done)
    }
  }, [router])

  if (!isPending) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="space-y-4 w-full max-w-xl px-6">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        <div className="h-52 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse w-full" />
      </div>
    </div>
  )
}
