"use client"

import { motion } from "framer-motion"

const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
}

export default function MotionContainer({
  children,
  effect = "fadeIn",
  delay = 0,
  duration = 0.6,
  className = "",
  ...props
}) {
  const selectedVariant = variants[effect] || variants.fadeIn

  return (
    <motion.div
      className={className}
      variants={selectedVariant}
      initial="hidden"
      animate="visible"
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
