"use client"

import { useState } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, ChevronLeft, ChevronRight } from "lucide-react"
import Modal from "../ui-components/Modal"

export default function PostCard({ post, size = "default", className = "" }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null)
  const [touchStartX, setTouchStartX] = useState(null)

  const sizeClasses = {
    compact: {
      avatar: 28,
      padding: "p-2 sm:p-3",
      username: "text-xs sm:text-sm",
      time: "text-[10px] sm:text-xs",
      content: "text-xs sm:text-sm",
      actions: "text-sm",
      likes: "text-[10px]",
      comments: "text-[10px] sm:text-xs",
      viewAll: "text-[10px]",
      spacing: "gap-2 mb-1",
    },
    default: {
      avatar: 32,
      padding: "p-3 sm:p-4",
      username: "text-sm",
      time: "text-xs",
      content: "text-sm",
      actions: "text-base",
      likes: "text-xs",
      comments: "text-xs",
      viewAll: "text-xs",
      spacing: "gap-3 mb-2",
    },
    large: {
      avatar: 48,
      padding: "p-5 sm:p-6",
      username: "text-sm sm:text-base",
      time: "text-xs",
      content: "text-sm sm:text-base",
      actions: "text-xl",
      likes: "text-sm",
      comments: "text-sm",
      viewAll: "text-sm",
      spacing: "gap-4 mb-3",
    }
  }

  const s = sizeClasses[size]

  const handleImageClick = (index) => setActiveImageIndex(index)
  const closeModal = () => {
    setActiveImageIndex(null)
    setTouchStartX(null)
  }
  const showNextImage = () => {
    if (post.images && activeImageIndex < post.images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1)
    }
  }
  const showPrevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1)
    }
  }
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX
    if (deltaX > 50) showPrevImage()
    else if (deltaX < -50) showNextImage()
    setTouchStartX(null)
  }

  return (
    <Card className={`flex flex-col ${s.padding} w-full ${className}`}>
      <div className={`flex items-center justify-between ${s.spacing}`}>
        <div className="flex items-center gap-2">
          <Avatar src={post.user?.avatar} alt={post.user?.name} size={s.avatar} />
          <div>
            <p className={`font-semibold text-[var(--foreground)] ${s.username}`}>
              {post.user?.name}
            </p>
            <p className={`text-[var(--muted-foreground)] ${s.time}`}>
              {post.time}
            </p>
          </div>
        </div>
        <button className="text-[color:var(--muted-foreground)] text-xl">•••</button>
      </div>

      <p className={`text-[var(--foreground)] ${s.content} ${s.spacing}`}>
        {post.content}
      </p>

      {/* ... phần hiển thị ảnh và modal giữ nguyên ... */}

      <div className={`flex mt-3 gap-4 text-[color:var(--muted-foreground)] ${s.actions}`}>
        <button><Heart className="h-5 w-5" /></button>
        <button>💬</button>
        <button>📤</button>
      </div>

      <p className={`text-[color:var(--muted-foreground)] ${s.likes} mt-1`}>
        {post.likes} likes
      </p>

      {post.latestComment && (
        <div className={`${s.comments} mt-1`}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      <button className={`text-[color:var(--muted-foreground)] mt-2 hover:underline ${s.viewAll}`}>
        View all {post.totalComments} comments
      </button>

      {activeImageIndex !== null && (
        <Modal isOpen={true} onClose={closeModal}>
          <div
            className="relative w-full h-[60vh] sm:h-[70vh]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={post.images[activeImageIndex]}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
            />
            <button
              className="absolute top-1/2 left-0 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-r"
              onClick={showPrevImage}
              disabled={activeImageIndex === 0}
            >
              <ChevronLeft />
            </button>
            <button
              className="absolute top-1/2 right-0 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-l"
              onClick={showNextImage}
              disabled={activeImageIndex === post.images.length - 1}
            >
              <ChevronRight />
            </button>
          </div>
        </Modal>
      )}
    </Card>
  )
}
