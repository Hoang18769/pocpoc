"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import UserHeader from "./UserHeader"
export default function PostCard({
  post,
  size = "default", // "compact", "default", "large"
  className = "",
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
      content:
        size === "compact" ? "text-xs sm:text-sm" : size === "large" ? "text-sm sm:text-base" : "text-xs sm:text-sm",
      actions: size === "compact" ? "text-sm" : size === "large" ? "text-xl" : "text-base",
      likes: size === "compact" ? "text-[10px]" : size === "large" ? "text-sm" : "text-xs",
      comments: size === "compact" ? "text-[10px] sm:text-xs" : size === "large" ? "text-sm" : "text-xs sm:text-sm",
      viewAll: size === "compact" ? "text-[10px]" : size === "large" ? "text-sm" : "text-xs",
      spacing: size === "compact" ? "gap-2 mb-1" : size === "large" ? "gap-4 mb-3" : "gap-3 mb-2",
    }
  }

  const textSizes = getTextSizes()
  const imageSize = getImageSize()
  const padding = getPadding()

  // Xác định layout dựa trên kích thước màn hình
  const layout = isMobile ? "flex-col" : "flex-row"

  // Icon components
  const HeartIcon = ({ size = 20, filled = false }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )

  const CommentIcon = ({ size = 20 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )

  const ShareIcon = ({ size = 20 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors"
    >
      <path d="m22 5-10 7L2 5" />
      <path d="M2 19V5" />
      <path d="M22 19V5" />
      <path d="M2 5h20" />
      <path d="M2 19h20" />
    </svg>
  )

  // Xác định kích thước icon dựa trên prop size
  const getIconSize = () => {
    return size === "compact" ? 16 : size === "large" ? 24 : 20
  }

  return (
    <div
      className={`
        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
        rounded-xl shadow-sm overflow-hidden ${padding} ${className}
      `}
    >
      {/* Header - User Info */}
      <UserHeader
        user="{post.user}"
        variant="post"
        lastonline={true}
        size={size}
        className="px-0 hover:bg-transparent dark:hover:bg-transparent -mx-1"
      />

      {/* Content Container */}
      <div className={`flex ${layout} gap-4 mt-3`}>
        {/* LEFT SIDE: Nội dung bài viết */}
        <div className="flex-1 min-w-0">
          {/* Nội dung bài viết */}
          <p className={`${textSizes.content} text-gray-800 dark:text-gray-200 mb-3`}>""</p>

          {/* RIGHT SIDE: Hình ảnh (chỉ hiển thị trên mobile) */}
          {isMobile && (
            <div
              className="w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3"
              style={{
                height: imageSize.height,
              }}
            >
              <Image
                src={post.image || "/placeholder.svg"}
                alt="Post image"
                width={500}
                height={500}
                className="object-cover w-full h-full transition-opacity hover:opacity-95"
              />
            </div>
          )}

          {/* Hành động */}
          <div className={`flex ${textSizes.spacing} text-gray-600 dark:text-gray-300 ${textSizes.actions} mb-2`}>
            <button className="hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <HeartIcon size={getIconSize()} />
            </button>
            <button className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <CommentIcon size={getIconSize()} />
            </button>
            <button className="hover:text-green-500 dark:hover:text-green-400 transition-colors">
              <ShareIcon size={getIconSize()} />
            </button>
          </div>

          {/* Lượt thích */}
          <p className={`text-gray-600 dark:text-gray-300 ${textSizes.likes} mb-2`}>{post.likes} likes</p>

          {/* Comment mới nhất */}
          <div className={`${textSizes.comments} text-gray-800 dark:text-gray-200`}>
            <span className="font-semibold">{post.latestComment.user}</span>
            <span className="ml-2">{post.latestComment.content}</span>
          </div>

          {/* Xem thêm */}
          <button
            className={`text-gray-500 dark:text-gray-400 mt-2 hover:text-gray-700 dark:hover:text-gray-300 hover:underline transition-colors ${textSizes.viewAll}`}
          >
            View all {post.totalComments} comments
          </button>
        </div>

        {/* RIGHT SIDE: Hình ảnh (chỉ hiển thị trên tablet và desktop) */}
        {!isMobile && (
          <div
            className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0"
            style={{
              width: imageSize.width,
              height: "auto",
            }}
          >
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              width={500}
              height={500}
              className="object-cover w-full h-full transition-opacity hover:opacity-95"
            />
          </div>
        )}
      </div>
    </div>
  )
}
