"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import avt from "@/assests/photo/AfroAvatar.png"

export default function PostCardResponsive({ 
  post, 
  size = "default", // "compact", "default", "large"
  className = "" 
}) {
  // Hook để kiểm tra kích thước màn hình
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    // Kiểm tra kích thước màn hình khi component được mount
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024) // md to lg breakpoint
    }

    // Kiểm tra ban đầu
    checkScreenSize()

    // Thêm event listener để kiểm tra khi resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Xác định kích thước avatar dựa trên prop size và responsive
  const getAvatarSize = () => {
    if (isMobile) {
      return size === "compact" ? 28 : size === "large" ? 36 : 32
    }
    
    return size === "compact" ? 32 : size === "large" ? 48 : 40
  }

  // Xác định kích thước ảnh dựa trên prop size và responsive
  const getImageSize = () => {
    if (isMobile) {
      return { width: "100%", height: size === "compact" ? "150px" : size === "large" ? "250px" : "200px" }
    } else if (isTablet) {
      return { width: size === "compact" ? "200px" : size === "large" ? "300px" : "250px", height: "auto" }
    } else {
      return { width: size === "compact" ? "250px" : size === "large" ? "350px" : "300px", height: "auto" }
    }
  }

  // Xác định padding dựa trên prop size
  const getPadding = () => {
    return size === "compact" ? "p-2 sm:p-3" : size === "large" ? "p-5 sm:p-6" : "p-3 sm:p-4"
  }

  // Xác định kích thước font và spacing
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

  // Xác định layout dựa trên kích thước màn hình
  const layout = isMobile ? "flex-col" : "flex-row"

  return (
    <Card className={`flex ${layout} ${padding} ${className}`}>
      {/* LEFT SIDE: Thông tin bài viết */}
      <div className="flex-1">
        {/* Header */}
        <div className={`flex items-center justify-between ${textSizes.spacing}`}>
          <div className="flex items-center gap-2">
            <Avatar 
              src={post.user?.avatar || avt}

              alt={post.user?.name || "name"} 
              size={getAvatarSize()} 
            />
            <div>
              <p className={`font-semibold ${textSizes.username}`}>{post.user.name}</p>
              <p className={`text-gray-500 ${textSizes.time}`}>{post.time}</p>
            </div>
          </div>
          <button className="text-gray-400 text-xl">•••</button>
        </div>

        {/* Nội dung bài viết */}
        <p className={`${textSizes.content} ${textSizes.spacing}`}>{post.content}</p>

        {/* Hành động */}
        <div className={`flex ${textSizes.spacing} text-gray-500 ${textSizes.actions}`}>
          <button>❤️</button>
          <button>💬</button>
          <button>📤</button>
        </div>

        {/* Lượt thích */}
        <p className={`text-gray-500 ${textSizes.likes} ${textSizes.spacing}`}>{post.likes} likes</p>

        {/* Comment mới nhất */}
        <div className={textSizes.comments}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>

        {/* Xem thêm */}
        <button className={`text-gray-400 mt-2 hover:underline ${textSizes.viewAll}`}>
          View all {post.totalComments} comments
        </button>
      </div>

      {/* RIGHT SIDE: Hình ảnh */}
      <div 
        className={`
          ${isMobile ? 'w-full mt-3' : isTablet ? `w-[${imageSize.width}]` : `w-[${imageSize.width}]`} 
          rounded-lg overflow-hidden
        `}
        style={{ 
          width: imageSize.width,
          height: isMobile ? imageSize.height : 'auto'
        }}
      >
        <Image
          src={post.image || "/placeholder.svg"}
          alt="Post image"
          width={500}
          height={500}
          className={`object-cover w-full ${isMobile ? 'h-full' : 'h-auto'}`}
        />
      </div>
    </Card>
  )
}

