"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from "react"
import Cookies from 'js-cookie'

export default function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Tránh flash light-mode trước khi dark-mode được apply
    return <div className="invisible">{children}</div>
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  )
}
