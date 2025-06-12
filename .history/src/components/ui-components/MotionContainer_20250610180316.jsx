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
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  slideRight: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  // 🎯 Custom slide theo hướng
  slideHorizontal: {
    initial: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 100 : -100,
    }),
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -100 : 100,
    }),
  },
  flipIn: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
    transition: { duration: 0.5 },
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
  direction = 0, // ✅ thêm prop direction
  className = "",
  style: customStyle = {},
}) {
  const variant = variantsMap[effect] || variantsMap.fadeUp
  const isDirectional = typeof variant.initial === "function" // kiểm tra có dùng custom không

  return (
    <motion.div
      key={modeKey}
      custom={direction}
      initial={isDirectional ? "initial" : variant.initial}
      animate="animate"
      exit={isDirectional ? "exit" : variant.exit}
      variants={variant}
      transition={variant.transition || { duration, delay }}
      className={className}
      style={variant.style || customStyle}
    >
      {children}
    </motion.div>
  )
}
