'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 w-12 h-12 bg-[var(--card)] rounded-full hover:opacity-90 transition-opacity flex items-center justify-center overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {currentTheme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
