"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart } from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Modal from "../ui-components/Modal"
export default function PostCard({ post, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(undefined)

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
  const padding = size === "compact" ? "p-2 sm:p-3" : size === "large" ? "p-5 sm:p-6" : "p-3 sm:p-4"

  return (
    <Card className={`flex flex-col ${padding} w-full ${className}`}>
      {/* Avatar + Name + Time */}
      <div className={`flex items-center justify-between ${textSizes.spacing}`}>
        <div className="flex items-center gap-2">
          <Avatar
            src={post.user?.avatar}
            alt={post.user?.name}
            size={getAvatarSize()}
          />
          <div>
            <p className={`font-semibold text-[var(--foreground)] ${textSizes.username}`}>
              {post.user?.name}
            </p>
            <p className={`text-[var(--muted-foreground)] ${textSizes.time}`}>
              {post.time}
            </p>
          </div>
        </div>
        <button className="text-[color:var(--muted-foreground)] text-xl">•••</button>
      </div>

      {/* Post content */}
      <p className={`text-[var(--foreground)] ${textSizes.content} ${textSizes.spacing}`}>
        {post.content}
      </p>

      {/* Image grid */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="mt-2 w-full">
          {post.images.length <= 3 && (
            <div className="flex gap-1 rounded-lg overflow-hidden">
              {post.images.map((img, index) => (
                <div key={index} className="relative flex-1 aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {post.images.length === 4 && (
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              {post.images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {post.images.length > 4 && (
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              {post.images.slice(0, 4).map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        +{post.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={`flex mt-3 gap-4 text-[color:var(--muted-foreground)] ${textSizes.actions}`}>
        <button><Heart className="h-5 w-5" /></button>
        <button>💬</button>
        <button>📤</button>
      </div>

      {/* Likes */}
      <p className={`text-[color:var(--muted-foreground)] ${textSizes.likes} mt-1`}>
        {post.likes} likes
      </p>

      {/* Latest comment */}
      {post.latestComment && (
        <div className={`${textSizes.comments} mt-1`}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      {/* View all comments */}
      <button className={`text-[color:var(--muted-foreground)] mt-2 hover:underline ${textSizes.viewAll}`}>
        View all {post.totalComments} comments
      </button>
    </Card>
  )
}
