'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Ngăn hydrate mismatch trên server
    return <div className="opacity-0">{children}</div>
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system" // hoặc "light" nếu bạn muốn mặc định sáng
      enableSystem={true}
      storageKey="theme" // Lưu theme người dùng
    >
      {children}
    </NextThemesProvider>
  )
}
