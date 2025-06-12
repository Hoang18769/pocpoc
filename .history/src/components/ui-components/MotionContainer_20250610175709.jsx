"use client"

import { motion } from "framer-motion"

const variantsMap = {
  fadeUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  fadeDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
  slideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  },
  slideDown: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -15, scale: 0.95 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 15, scale: 0.95 },
  },
  flipIn: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
    transition: { duration: 0.5 },
    style: { transformStyle: "preserve-3d" },
  },
  scaleY: {
    initial: { opacity: 0, scaleY: 0.8 },
    animate: { opacity: 1, scaleY: 1 },
    exit: { opacity: 0, scaleY: 0.8 },
    style: { transformOrigin: "top" },
  },
}

export default function MotionContainer({
  children,
  modeKey,
  effect = "fadeUp",
  duration = 0.3,
  delay = 0,
  className = "",
  style: customStyle = {},
}) {
  const variant = variantsMap[effect] || variantsMap.fadeUp

  return (
    <motion.div
      key={modeKey}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={
        variant.transition || {
          duration,
          delay,
        }
      }
      className={className}
      style={{ ...(variant.style || {}), ...customStyle }}
    >
      {children}
    </motion.div>
  )
}
