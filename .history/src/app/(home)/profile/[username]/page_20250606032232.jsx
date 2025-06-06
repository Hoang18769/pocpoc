"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, MessageCircle, SendHorizonal } from "lucide-react"
import PostModal from "./PostModal"
import ImageView from "../ui-components/ImageView"

export default function PostCard({ post, liked, onLikeToggle, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(undefined)
  const [activeImageIndex, setActiveImageIndex] = useState(null)

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 640)
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

  const handleImageClick = (index) => setActiveImageIndex(index)
  const closeModal = () => setActiveImageIndex(null)

  // ⚠️ Map post.files to image list
  const imageUrls = Array.isArray(post.files) ? post.files : []

  return (
    <Card className={`flex flex-col ${padding} w-full ${className}`}>
      <div className={`flex items-center justify-between ${textSizes.spacing}`}>
        <div className="flex items-center gap-2">
          <Avatar
            src={post.author?.avatar}
            alt={post.author?.username || ""}
            size={getAvatarSize()}
          />
          <div>
            <p className={`font-semibold text-[var(--foreground)] ${textSizes.username}`}>
              {post.author?.username}
            </p>
            <p className={`text-[var(--muted-foreground)] ${textSizes.time}`}>
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button className="text-[color:var(--muted-foreground)] text-xl">•••</button>
      </div>

      <p className={`text-[var(--foreground)] ${textSizes.content} ${textSizes.spacing}`}>
        {post.content}
      </p>

      {/* Image grid */}
      <ImageView images={imageUrls} onImageClick={handleImageClick} />

      <div className={`flex mt-3 gap-4 text-[color:var(--muted-foreground)] ${textSizes.actions}`}>
        <button onClick={onLikeToggle} className="p-2 rounded-full">
          <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
        <button><MessageCircle className="h-5 w-5" /></button>
        <button><SendHorizonal className="h-5 w-5" /></button>
      </div>

      <p className={`text-[color:var(--muted-foreground)] ${textSizes.likes} mt-1`}>
        {post.likeCount} likes
      </p>

      {/* Optional comment preview */}
      {post.latestComment && (
        <div className={`${textSizes.comments} mt-1`}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      <button className={`text-[color:var(--muted-foreground)] mt-2 hover:underline ${textSizes.viewAll}`}>
        View all {post.commentCount} comments
      </button>

      {/* Modal dạng Instagram */}
      {activeImageIndex !== null && (
        <PostModal post={post} activeIndex={activeImageIndex} onClose={closeModal} />
      )}
    </Card>
  )
}