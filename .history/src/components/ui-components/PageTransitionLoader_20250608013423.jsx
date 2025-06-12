"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function PageTransitionLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let timeoutId

    setLoading(true)

    // Thời gian tối thiểu hiển thị loading (1s)
    timeoutId = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  )
}
