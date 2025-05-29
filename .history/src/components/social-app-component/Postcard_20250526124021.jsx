"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import avt from "@/assests/photo/AfroAvatar.png"
import {Heart} from "lucide-react"
export default function PostCard({ post, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const getAvatarSize = () => {
    if (isMobile) return size === "compact" ? 28 : size === "large" ? 36 : 32
    return size === "compact" ? 32 : size === "large" ? 48 : 40
  }

  const getImageSize = () => {
    if (isMobile) {
      return { width: "100%", height: size === "compact" ? "150px" : size === "large" ? "250px" : "200px" }
    } else if (isTablet) {
      return { width: size === "compact" ? "200px" : size === "large" ? "300px" : "250px", height: "auto" }
    } else {
      return { width: size === "compact" ? "250px" : size === "large" ? "350px" : "300px", height: "auto" }
    }
  }

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
  const imageSize = getImageSize()
  const padding = getPadding()
  const layout = isMobile ? "flex-col" : "flex-row"

  return (
    <Card className={`flex w-[100px] ${layout} ${padding} ${className}` }>
      {/* LEFT SIDE */}
      <div className="flex-1">
        <div className={`flex items-center justify-between ${textSizes.spacing}`}>
          <div className="flex items-center gap-2">
            <Avatar
              src={post.user?.avatar || avt}
              alt={post.user.name || "name"}
              size={getAvatarSize()}
            />
            <div>
              <p className={`font-semibold text-[var(--foreground)]${textSizes.username}`}>{post.user.name}</p>
              <p className={`text-[var(--foreground) ${textSizes.time}`}>{post.time}</p>
            </div>
          </div>
          <button className="text-[color:var(--muted-foreground)] text-xl">•••</button>
        </div>

        <p className={`text-[var(--foreground) ${textSizes.content} ${textSizes.spacing}`}>{post.content}</p>

        <div className={`flex ${textSizes.spacing} text-[color:var(--muted-foreground)] ${textSizes.actions}`}>
          <button>
            <Heart className="h-5 w-5" />
          </button>
          <button>💬</button>
          <button>📤</button>
        </div>

        <p className={`text-[color:var(--muted-foreground)] ${textSizes.likes} ${textSizes.spacing}`}>
          {post.likes} likes
        </p>

        <div className={textSizes.comments}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>

        <button className={`text-[color:var(--muted-foreground)] mt-2 hover:underline ${textSizes.viewAll}`}>
          View all {post.totalComments} comments
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div
        className={`rounded-lg overflow-hidden ${isMobile ? "w-full mt-3" : ""}`}
        style={{
          width: imageSize.width,
          height: isMobile ? imageSize.height : "auto"
        }}
      >
        <Image
          src={post.image || avt}
          alt="Post image"
          width={500}
          height={500}
          className={`object-cover w-full ${isMobile ? "h-full" : "h-auto"}`}
        />
      </div>
    </Card>
  )
}
