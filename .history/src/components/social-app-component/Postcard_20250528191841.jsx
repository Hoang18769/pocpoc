"use client";

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
      avatar: "w-7 h-7 sm:w-8 sm:h-8",
      username: "text-[10px] sm:text-xs",
      time: "text-[9px] sm:text-[10px]",
      content: "text-xs sm:text-sm",
      actions: "text-sm",
      likes: "text-[9px]",
      comments: "text-[10px] sm:text-xs",
      viewAll: "text-[10px]",
      spacing: "gap-2 mb-1",
      padding: "p-2 sm:p-3",
    },
    default: {
      avatar: "w-8 h-8 sm:w-10 sm:h-10",
      username: "text-xs sm:text-sm",
      time: "text-[10px] sm:text-xs",
      content: "text-sm",
      actions: "text-base",
      likes: "text-xs",
      comments: "text-xs",
      viewAll: "text-xs",
      spacing: "gap-3 mb-2",
      padding: "p-3 sm:p-4",
    },
    large: {
      avatar: "w-10 h-10 sm:w-12 sm:h-12",
      username: "text-sm sm:text-base",
      time: "text-xs",
      content: "text-base",
      actions: "text-xl",
      likes: "text-sm",
      comments: "text-sm",
      viewAll: "text-sm",
      spacing: "gap-4 mb-3",
      padding: "p-5 sm:p-6",
    },
  }[size];

  const handleImageClick = (index) => {
    setActiveImageIndex(index)
  }

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

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX
    if (deltaX > 50) showPrevImage()
    else if (deltaX < -50) showNextImage()
    setTouchStartX(null)
  }

  return (
    <Card className={`flex flex-col w-full ${sizeClasses.padding} ${className}`}>
      <div className={`flex items-center justify-between ${sizeClasses.spacing}`}>
        <div className="flex items-center gap-2">
          <Avatar
            src={post.user?.avatar}
            alt={post.user?.name}
            className={sizeClasses.avatar}
          />
          <div>
            <p className={`font-semibold text-[var(--foreground)] ${sizeClasses.username}`}>
              {post.user?.name}
            </p>
            <p className={`text-[var(--muted-foreground)] ${sizeClasses.time}`}>
              {post.time}
            </p>
          </div>
        </div>
        <button className="text-[color:var(--muted-foreground)] text-lg">•••</button>
      </div>

      <p className={`text-[var(--foreground)] ${sizeClasses.content} ${sizeClasses.spacing}`}>
        {post.content}
      </p>

      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="rounded-lg overflow-hidden mt-2">
          {post.images.length === 1 && (
            <div className="relative aspect-square">
              <Image
                src={post.images[0]}
                alt="Post image"
                fill
                className="object-cover cursor-pointer"
                onClick={() => handleImageClick(0)}
              />
            </div>
          )}

          {[2, 3].includes(post.images.length) && (
            <div className={`grid grid-cols-${post.images.length} gap-1`}>
              {post.images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    onClick={() => handleImageClick(index)}
                    className="object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {post.images.length === 4 && (
            <div className="grid grid-cols-2 gap-1">
              {post.images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    onClick={() => handleImageClick(index)}
                    className="object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {post.images.length >= 5 && (
            <div className="grid grid-cols-2 gap-1">
              {post.images.slice(0, 3).map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    onClick={() => handleImageClick(index)}
                    className="object-cover cursor-pointer"
                  />
                </div>
              ))}
              <div className="relative aspect-square col-span-1">
                <Image
                  src={post.images[3]}
                  alt="Post image 4"
                  fill
                  onClick={() => handleImageClick(3)}
                  className="object-cover cursor-pointer brightness-50"
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg">
                  +{post.images.length - 4}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`flex mt-3 gap-4 text-[color:var(--muted-foreground)] ${sizeClasses.actions}`}>
        <button><Heart className="h-5 w-5" /></button>
        <button>💬</button>
        <button>📤</button>
      </div>

      <p className={`text-[color:var(--muted-foreground)] ${sizeClasses.likes} mt-1`}>
        {post.likes} likes
      </p>

      {post.latestComment && (
        <div className={`${sizeClasses.comments} mt-1`}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      <button className={`text-[color:var(--muted-foreground)] mt-2 hover:underline ${sizeClasses.viewAll}`}>
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
  );
}
