"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function PageTransitionLoader() {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  )
}
