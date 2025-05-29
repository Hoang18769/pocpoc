"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

export default function ProgressBar() {
  const pathname = usePathname()

  useEffect(() => {
    NProgress.start()
    const timeout = setTimeout(() => {
      NProgress.done()
    }, 300) // giả lập tải 300ms

    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}
