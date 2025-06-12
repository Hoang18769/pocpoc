"use client"

import Image from "next/image"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  SendHorizonal,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Avatar from "../ui-components/Avatar"
import Modal from "../ui-components/Modal"

export default function PostModal({ post, liked, likeCount, activeIndex = 0, onClose, onLikeToggle }) {
  const images = post?.files || post?.images || []
  const [index, setIndex] = useState(activeIndex)
  const [direction, setDirection] = useState(0)

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset, velocity) => Math.abs(offset) * velocity

  const paginate = (newDirection) => {
    const newIndex = index + newDirection
    if (newIndex >= 0 && newIndex < images.length) {
      setDirection(newDirection)
      setIndex(newIndex)
    }
  }

  if (!Array.isArray(images) || !images[index]) return null

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col md:flex-row w-full h-[90vh] bg-[var(--card)] text-[var(--card-foreground)] rounded-xl overflow-hidden">
        {/* Image side */}
        <div className="relative w-full md:w-3/5 bg-black overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              className="relative w-full h-full"
              custom={direction}
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? 300 : -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x)
                if (swipe < -swipeConfidenceThreshold && index < images.length - 1) {
                  paginate(1)
                } else if (swipe > swipeConfidenceThreshold && index > 0) {
                  paginate(-1)
                }
              }}
            >
              <Image
                src={images[index]}
                alt={`Post image ${index + 1}`}
                fill
                unoptimized
                className="object-contain"
              />

              {index > 0 && (
                <button
                  className="absolute top-1/2 left-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => paginate(-1)}
                >
                  <ChevronLeft />
                </button>
              )}

              {index < images.length - 1 && (
                <button
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => paginate(1)}
                >
                  <ChevronRight />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Conte