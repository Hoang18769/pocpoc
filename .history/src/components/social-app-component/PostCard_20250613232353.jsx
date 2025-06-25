"use client"

import { useEffect, useState } from "react"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, MessageCircle, SendHorizonal, MoreVertical } from "lucide-react"
import ImageView from "../ui-components/ImageView"
import PostModal from "./PostModal"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import api from "@/utils/axios"

dayjs.extend(relativeTime)

export default function PostCard({ post, liked, onLikeToggle, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(undefined)
  const [activeImageIndex, setActiveImageIndex] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newContent, setNewContent] = useState(post.content || "")
  const [newPrivacy, setNewPrivacy] = useState(post.privacy || "PUBLIC")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isModalOpen = activeImageIndex !== null || showModal

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 640)
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  if (isMobile === undefined) return null

  const avatarSize = size === "compact" ? (isMobile ? 28 : 32) : size === "large" ? (isMobile ? 36 : 48) : (isMobile ? 32 : 40)
  const padding = size === "compact" ? "p-2 sm:p-3" : size === "large" ? "p-5" : "p-4"
  const spacing = size === "compact" ? "gap-2 mb-1" : size === "large" ? "gap-4 mb-3" : "gap-3 mb-2"

  const textSizes = {
    username: size === "compact" ? "text-sm" : size === "large" ? "text-base" : "text-sm",
    time: "text-xs text-[var(--muted-foreground)]",
    content: "text-sm text-[var(--foreground)]",
    likes: "text-xs text-[var(--muted-foreground)] mt-1",
    viewAll: "text-xs text-[var(--muted-foreground)] mt-2 hover:underline",
    comment: "text-sm text-[var(--foreground)] mt-1"
  }

  const handleEdit = () => {
    setShowOptions(false)
    setEditing(true)
  }

  const handleSaveEdit = async () => {
  setLoading(true)
  try {
    const requests = []
    if (newContent !== post.content) {
      requests.push(
        api.patch(`/v1/posts/update-content/${post.id}`, null, {
          params: { content: newContent }
        })
      )
    }
    if (newPrivacy !== post.privacy) {
      requests.push(
        api.patch(`/v1/posts/update-privacy/${post.id}`, null, {
          params: {privacy: newPrivacy }
        })
      )
    }
    await Promise.all(requests)
    toast.success("Cập nhật bài viết thành công!")
    post.content = newContent
    post.privacy = newPrivacy
    setEditing(false)
  } catch (err) {
    toast.error("Lỗi khi cập nhật bài viết!")
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const handleShare = () => {
    toast.success("Bài viết đã được chia sẻ (demo)!")
  }

  const renderPrivacyIcon = () => {
    switch (post.privacy) {
      case "PUBLIC": return "🌍"
      case "FRIENDS": return "👥"
      case "PRIVATE": return "🔒"
      default: return ""
    }
  }

  return (
    <Card className={`bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-sm ${padding} w-full ${className}`}>
      <div className={`flex items-start justify-between ${spacing} relative`}>
        <div
          className="flex items-center gap-2 cursor-pointer hover:underline"
          onClick={() => router.push(`/profile/${post.author?.username}`)}
        >
          <Avatar
            src={post.author?.profilePictureUrl}
            alt={post.author?.username || ""}
            size={avatarSize}
          />
          <div>
            <p className={`font-semibold ${textSizes.username}`}>
              {post.author?.familyName + " " + post.author?.givenName}
            </p>
            <p className={textSizes.time}>
              {dayjs(post.createdAt).fromNow()} {renderPrivacyIcon()}
            </p>
            {post.author?.mutualFriendsCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {post.author.mutualFriendsCount} bạn chung
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowOptions(!showOptions)} className="text-xl text-[var(--muted-foreground)]">
            <MoreVertical className="w-5 h-5" />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[var(--background)] border rounded shadow z-10">
              <button onClick={handleEdit} className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--input)]">✏️ Chỉnh sửa</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--input)]">🗑️ Xóa</button>
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-3 mb-3">
          <textarea
            className="w-full p-3 border rounded-md text-sm text-[var(--foreground)] bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Nhập nội dung bài viết..."
          />
          <select
            className="w-full p-3 border rounded-md text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newPrivacy}
            onChange={(e) => setNewPrivacy(e.target.value)}
          >
            <option value="PUBLIC">🌍 Công khai</option>
            <option value="FRIENDS">👥 Bạn bè</option>
            <option value="PRIVATE">🔒 Chỉ mình tôi</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "💾 Lưu"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[var(--input)] disabled:opacity-50"
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      ) : (
        <p className={`${textSizes.content} ${spacing}`}>
          {post.content}
        </p>
      )}

      {Array.isArray(post.files) && post.files.length > 0 && (
        <ImageView
          images={post.files}
          isActive={!isModalOpen}
          onImageClick={(i) => setActiveImageIndex(i)}
        />
      )}

      <div className="flex mt-3 gap-4 text-[var(--muted-foreground)]">
        <button onClick={onLikeToggle} className="p-2 rounded-full">
          <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        <button onClick={() => setShowModal(true)}><MessageCircle className="h-5 w-5" /></button>
        <button onClick={handleShare}><SendHorizonal className="h-5 w-5" /></button>
      </div>

      <p className={textSizes.likes}>{post.likeCount} lượt thích</p>

      {post.latestComment && (
        <div className={textSizes.comment}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      <button className={textSizes.viewAll} onClick={() => setShowModal(true)}>
        Xem tất cả {post.commentCount} bình luận
      </button>

      {isModalOpen && (
        <PostModal
          post={post}
          liked={post.liked}
          likeCount={post.likeCount}
          activeIndex={activeImageIndex}
          onClose={() => {
            setActiveImageIndex(null)
            setShowModal(false)
          }}
          onLikeToggle={() => onLikeToggle(post.id)}
        />
      )}
    </Card>
  )
}
