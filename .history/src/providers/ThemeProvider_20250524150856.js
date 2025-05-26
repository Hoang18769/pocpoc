'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import MotionContainer from './MotionContainer' // import đúng path

export default function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="opacity-0">{children}</div>
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="theme"
      disableTransitionOnChange
    >
      <ThemeAnimatedWrapper>{children}</ThemeAnimatedWrapper>
    </NextThemesProvider>
  )
}

// Component con để lấy theme hiện tại và render animation
function ThemeAnimatedWrapper({ children }) {
  const { theme, resolvedTheme } = useTheme()

  // resolvedTheme là theme thực tế đang dùng (light/dark)
  // dùng nó làm key để khi đổi theme, MotionContainer tái animate
  const modeKey = resolvedTheme || theme

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionContainer key={modeKey} effect="fadeUp" duration={0.5}>
        {children}
      </MotionContainer>
    </AnimatePresence>
  )
}
