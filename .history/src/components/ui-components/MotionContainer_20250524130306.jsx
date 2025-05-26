"use client"

import { motion } from "framer-motion"

const variantsMap = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
}

export default function MotionContainer({
  children,
  modeKey,
  effect = "fadeUp",
  duration = 0.3,
}) {
  const variant = variantsMap[effect] || variantsMap.fadeUp

  return (
    <motion.div
      key={modeKey}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}
