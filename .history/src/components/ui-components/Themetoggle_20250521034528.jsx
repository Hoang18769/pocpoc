"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // For debugging
  useEffect(() => {
    if (mounted) {
      console.log("Current theme:", theme)
    }
  }, [theme, mounted])

  if (!mounted) return null

  // Force theme to be either "light" or "dark"
  const currentTheme = theme === "system" ? "light" : theme === "dark" ? "dark" : "light"

  const toggleTheme = () => {
    console.log("Toggling theme from", currentTheme)
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 w-12 h-12  rounded-full bg-secondary text-secondary-foreground  hover:opacity-90 transition-opacity"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
