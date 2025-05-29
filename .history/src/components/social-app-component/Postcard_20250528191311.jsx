"use client"

import { useState } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, ChevronLeft, ChevronRight } from "lucide-react"
import Modal from "../ui-components/Modal"

export default function PostCard({ post, className = "" }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null)
  const [touchStartX, setTouchStartX] = useState(null)

  const handleImageClick = (index) => setActiveImageIndex(index)
  const closeModal = () => {
    setActiveImageIndex(null)
    setTouchStartX(null)
  }
  const showNextImage = () => {
    if (activeImageIndex < post.images.length - 1) setActiveImageIndex(i => i + 1)
  }
  const showPrevImage = () => {
    if (activeImageIndex > 0) setActiveImageIndex(i => i - 1)
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
    <Card className={`flex flex-col p-3 sm:p-4 w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <Avatar
            src={post.user?.avatar}
            alt={post.user?.name}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
          <div>
            <p className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">
              {post.user?.name}
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">
              {post.time}
            </p>
          </div>
        </div>
        <button className="text-xl text-[var(--muted-foreground)]">•••</button>
      </div>

      {/* Content */}
      <p className="text-sm sm:text-base text-[var(--foreground)] mb-2 sm:mb-3">
        {post.content}
      </p>

      {/* Images */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="rounded-lg overflow-hidden mt-2">
          <div
            className={`grid gap-1 ${
              post.images.length === 1 ? "" :
              post.images.length === 2 ? "grid-cols-2" :
              post.images.length === 3 ? "grid-cols-3" :
              "grid-cols-2"
            }`}
          >
            {post.images.slice(0, 4).map((img, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={img}
                  alt={`Post image ${index + 1}`}
                  fill
                  className={`object-cover cursor-pointer ${
                    index === 3 && post.images.length > 4 ? "brightness-50" : ""
                  }`}
                  onClick={() => handleImageClick(index)}
                />
                {index === 3 && post.images.length > 4 && (
                  <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg">
                    +{post.images.length - 4}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex mt-3 gap-4 text-base text-[var(--muted-foreground)]">
        <button><Heart className="w-5 h-5" /></button>
        <button>💬</button>
        <button>📤</button>
      </div>

      <p className="text-xs mt-1 text-[var(--muted-foreground)]">
        {post.likes} likes
      </p>

      {post.latestComment && (
        <div className="text-xs sm:text-sm mt-1 text-[var(--foreground)]">
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      <button className="text-xs mt-2 hover:underline text-[var(--muted-foreground)]">
        View all {post.totalComments} comments
      </button>

      {/* Modal Preview */}
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
