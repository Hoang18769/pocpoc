"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import avt from "@/assests/photo/AfroAvatar.png"
import { Heart } from "lucide-react"

export default function PostCard({ post, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const getPadding = () => {
    return size === "compact" ? "p-2 sm:p-3" : size === "large" ? "p-5 sm:p-6" : "p-3 sm:p-4"
  }

  const getTextSizes = () => {
    return {
      username: size === "compact" ? "text-xs sm:text-sm" : size === "large" ? "text-sm sm:text-base" : "text-xs sm:text-sm",
      time: size === "compact" ? "text-[10px] sm:text-xs" : size === "large" ? "text-xs" : "text-[10px] sm:text-xs",
      content: size === "compact" ? "text-xs sm:text-sm" : size === "large" ? "text-sm sm:text-base" : "text-xs sm:text-sm",
      actions: size === "compact" ? "text-sm" : size === "large" ? "text-xl" : "text-base",
      likes: size === "compact" ? "text-[10px]" : size === "large" ? "text-sm" : "text-xs",
      comments: size === "compact" ? "text-[10px] sm:text-xs" : size === "large" ? "text-sm" : "text-xs sm:text-sm",
      viewAll: size === "compact" ? "text-[10px]" : size === "large" ? "text-sm" : "text-xs",
      spacing: size === "compact" ? "gap-2 mb-1" : size === "large" ? "gap-4 mb-3" : "gap-3 mb-2"
    }
  }

  const textSizes = getTextSizes()
  const padding = getPadding()
  // const layout = isMobile ? "flex-col" : "flex-row"

  return (
    <Card className={`flex ${layout} flex-row ${padding} ${className}`}>
      {/* LEFT SIDE (Text) */}
      {/* <div className={`flex-1 ${!post.image ? "w-full" : ""}`}> */}
            <div className={`flex-1 ${!post.image ? "w-full" : "w-[50%]"}`}>

        <div className={`flex items-center justify-between ${textSizes.spacing}`}>
          <div className="flex items-center gap-2">
            {/* Avatar với kích thước cố định qua className */}
            <Avatar
              src={post.user?.avatar || avt}
              alt={post.user?.name || "name"}
              className="w-10 h-10" // Tùy chỉnh trực tiếp
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

        <p className={`text-[var(--foreground)] ${textSizes.content} ${textSizes.spacing}`}>
          {post.content}
        </p>

        <div className={`flex ${textSizes.spacing} text-[color:var(--muted-foreground)] ${textSizes.actions}`}>
          <button><Heart className="h-5 w-5" /></button>
          <button>💬</button>
          <button>📤</button>
        </div>

        <p className={`text-[color:var(--muted-foreground)] ${textSizes.likes} ${textSizes.spacing}`}>
          {post.likes} likes
        </p>

        {post.latestComment && (
          <div className={textSizes.comments}>
            <span className="font-semibold">{post.latestComment.user}</span>
            <span className="ml-2">{post.latestComment.content}</span>
          </div>
        )}

        <button className={`text-[color:var(--muted-foreground)] mt-2 hover:underline ${textSizes.viewAll}`}>
          View all {post.totalComments} comments
        </button>
      </div>

      {/* RIGHT SIDE (Image if any) */}
      {post.image && (
        <div
          className={`rounded-lg overflow-hidden ${isMobile ? "w-full mt-3" : "ml-4"} flex-shrink-0`}
        >
          <Image
            src={post.image}
            alt="Post image"
            width={400} // Tùy chỉnh width cố định
            height={300} // Tùy chỉnh height cố định
            className="object-cover rounded-lg"
          />
        </div>
      )}
    </Card>
  )
}
