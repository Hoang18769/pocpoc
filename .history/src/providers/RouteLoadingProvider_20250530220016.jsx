"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

export default function RouteLoadingProvider({ children }) {
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 500) // đảm bảo loading hiển thị tối thiểu

    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
      )}
      {children}
    </>
  )
}
