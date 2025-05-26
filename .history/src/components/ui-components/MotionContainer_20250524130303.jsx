// components/ui-components/MotionFade.jsx
"use client"

import { motion } from "framer-motion"

const variantsMap = {
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
  zoomIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
}

export default function MotionFade({
  children,
  effect = "fadeInUp",
  duration = 0.3,
  delay = 0,
  className = "",
  ...props
}) {
  const variant = variantsMap[effect] || variantsMap.fadeInUp

  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
