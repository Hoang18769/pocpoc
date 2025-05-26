"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useState()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
    >
      {theme === "dark" ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-black" />}
    </button>
  )
}
