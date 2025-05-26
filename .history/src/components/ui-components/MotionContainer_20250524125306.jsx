"use client"

import { motion, AnimatePresence } from "framer-motion"

const variantsMap = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
}

export default function MotionContainer({
  children,
  modeKey,
  effect = "fadeInUp", // default effect
  duration = 0.3,
  delay = 0,
  className = "",
}) {
  const variant = variantsMap[effect] || variantsMap.fadeInUp

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={modeKey}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={{ duration, delay }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
