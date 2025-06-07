"use client"

import { useState, useEffect } from "react"
import Avatar from "../ui-components/Avatar"
export default function UserHeader({
  user,
  variant = "post", 
  lastonline = true,
  isme = false,
  size = "Large",
  className = "",
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Kiểm tra ban đầu
    checkIfMobile()

    // Thêm event listener để kiểm tra khi resize
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Mặc định user object
  const defaultUser = {
    name: "Name",
    avatar: "/placeholder.svg?height=100&width=100",
    lastOnline: "59 minutes ago",
  }

  // Merge với default nếu một số thuộc tính bị thiếu
  const userData = { ...defaultUser, ...user }

  // Xác định kích thước avatar dựa trên prop size và responsive
  const getAvatarSize = () => {
    if (isMobile) {
      return size === "compact" ? 28 : size === "large" ? 40 : 32
    }

    return size === "compact" ? 32 : size === "large" ? 48 : 40
  }

  // Xác định padding và spacing dựa trên prop size
  const getSpacing = () => {
    return {
      container: size === "compact" ? "p-1.5" : size === "large" ? "p-3" : "p-2",
      gap: size === "compact" ? "gap-1.5 sm:gap-2" : size === "large" ? "gap-3 sm:gap-4" : "gap-2 sm:gap-3",
      buttonPadding: size === "compact" ? "p-1" : size === "large" ? "p-2" : "p-1.5",
    }
  }

  // Xác định kích thước font dựa trên prop size
  const getTextSizes = () => {
    return {
      name:
        size === "compact" ? "text-xs sm:text-sm" : size === "large" ? "text-sm sm:text-base" : "text-xs sm:text-sm",
      lastOnline:
        size === "compact" ? "text-[10px] sm:text-xs" : size === "large" ? "text-xs" : "text-[10px] sm:text-xs",
    }
  }

  const spacing = getSpacing()
  const textSizes = getTextSizes()

  // Icon components
  const MessageIcon = ({ size = 16 }) => (
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
      className="text-gray-700 dark:text-gray-300"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )

  const DotsIcon = ({ size = 16 }) => (
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
      className="text-gray-500 dark:text-gray-400"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )

  const EditIcon = ({ size = 16 }) => (
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
      className="text-gray-700 dark:text-gray-300"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )

  // Xác định kích thước icon dựa trên prop size và responsive
  const getIconSize = () => {
    if (isMobile) {
      return size === "compact" ? 14 : size === "large" ? 18 : 16
    }

    return size === "compact" ? 14 : size === "large" ? 20 : 16
  }

  return (
    <div
      className={`
        flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
        ${spacing.container}
        ${className || ""}
      `}
    >
      {/* Avatar */}
      <Avatar
        src={userData.avatar}
        alt={userData.name}
        size={getAvatarSize()}
        variant="default"
        className="flex-shrink-0"
      />

      {/* User info */}
      <div className={`ml-2 sm:ml-3 flex-grow min-w-0 ${spacing.gap}`}>
        <h4
          className={`
          font-medium text-gray-900 dark:text-gray-100 truncate
          ${textSizes.name}
        `}
        >
          {userData.name}
        </h4>

        {lastonline && (
          <p
            className={`
            text-gray-500 dark:text-gray-400 truncate
            ${textSizes.lastOnline}
          `}
          >
            {userData.lastOnline}
          </p>
        )}
      </div>

      {/* Action buttons based on variant and isme */}
      <div className={`flex items-center flex-shrink-0 ${spacing.gap}`}>
        {/* Nếu là variant post và isme=true, hiển thị nút chỉnh sửa */}
        {variant === "post" && isme && (
          <button
            className={`
            rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
            ${spacing.buttonPadding}
          `}
          >
            <EditIcon size={getIconSize()} />
          </button>
        )}

        {/* Nếu là variant post, hiển thị dấu ba chấm */}
        {variant === "post" && !isme && (
          <button
            className={`
            rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
            ${size === "compact" ? "p-0.5" : size === "large" ? "p-1.5" : "p-1"}
          `}
          >
            <DotsIcon size={getIconSize()} />
          </button>
        )}

        {/* Nếu là variant chat, hiển thị biểu tượng nhắn tin */}
        {variant === "chat" && (
          <button
            className={`
            rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors
            ${spacing.buttonPadding}
          `}
          >
            <MessageIcon size={getIconSize()} />
          </button>
        )}
      </div>
    </div>
  )
}
