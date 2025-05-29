"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, MessageCircle,Share } from "lucide-react"
import PostModal from "./PostModal" // ✅ thêm dòng này

export default function PostCard({ post, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(undefined)
  const [activeImageIndex, setActiveImageIndex] = useState(null)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  if (isMobile === undefined) return null

  const getAvatarSize = () => {
    return isMobile
      ? size === "compact" ? 28 : size === "large" ? 36 : 32
      : size === "compact" ? 32 : size === "large" ? 48 : 40
  }

  const getTextSizes = () => ({
    username: size === "compact" ? "text-xs sm:text-sm" : size === "large" ? "text-sm sm:text-base" : "text-sm",
    time: size === "compact" ? "text-[10px] sm:text-xs" : size === "large" ? "text-xs" : "text-xs",
    content: size === "compact" ? "text-xs sm:text-sm" : size === "large" ? "text-sm sm:text-base" : "text-sm",
    actions: size === "compact" ? "text-sm" : size === "large" ? "text-xl" : "text-base",
    likes: size === "compact" ? "text-[10px]" : size === "large" ? "text-sm" : "text-xs",
    comments: size === "compact" ? "text-[10px] sm:text-xs" : size === "large" ? "text-sm" : "text-xs",
    viewAll: size === "compact" ? "text-[10px]" : size === "large" ? "text-sm" : "text-xs",
    spacing: size === "compact" ? "gap-2 mb-1" : size === "large" ? "gap-4 mb-3" : "gap-3 mb-2"
  })

  const textSizes = getTextSizes()
  const padding = size === "compact" ? "p-2 sm:p-3" : size === "large" ? "p-4 sm:p-5" : "p-2 sm:p-4"

  const handleImageClick = (index) => {
    setActiveImageIndex(index)
  }

  const closeModal = () => {
    setActiveImageIndex(null)
  }

  return (
    <Card className={`flex flex-col ${padding} w-full ${className}`}>
      <div className={`flex items-center justify-between ${textSizes.spacing}`}>
        <div className="flex items-center gap-2">
          <Avatar src={post.user?.avatar} alt={post.user?.name} size={getAvatarSize()} />
          <div>
            <p className={`font-semibold text-[var(--foreground)] ${textSizes.username}`}>{post.user?.name}</p>
            <p className={`text-[var(--muted-foreground)] ${textSizes.time}`}>{post.time}</p>
          </div>
        </div>
        <button className="text-[color:var(--muted-foreground)] text-xl">•••</button>
      </div>

      <p className={`text-[var(--foreground)] ${textSizes.content} ${textSizes.spacing}`}>{post.content}</p>

      {/* Image layout */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="rounded-lg overflow-hidden mt-2">
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

          {post.images.length === 2 && (
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

          {post.images.length === 3 && (
            <div className="grid grid-cols-3 gap-1">
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
        </div>
      )}

      <div className={`flex mt-3 gap-4 text-[color:var(--muted-foreground)] ${textSizes.actions}`}>
        <button><Heart className="h-5 w-5" /></button>
        <button><MessageCircle className="h-5 w-5"/></button>
        <button><Share /></button>
      </div>

      <p className={`text-[color:var(--muted-foreground)] ${textSizes.likes} mt-1`}>
        {post.likes} likes
      </p>

      {post.latestComment && (
        <div className={`${textSizes.comments} mt-1`}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      <button className={`text-[color:var(--muted-foreground)] mt-2 hover:underline ${textSizes.viewAll}`}>
        View all {post.totalComments} comments
      </button>

      {/* Modal ảnh dạng Instagram */}
      {activeImageIndex !== null && (
        <PostModal post={post} activeIndex={activeImageIndex} onClose={closeModal} />
      )}
    </Card>
  )
}
