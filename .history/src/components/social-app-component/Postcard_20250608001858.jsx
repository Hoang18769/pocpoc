"use client"

import { useEffect, useState } from "react"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, MessageCircle, SendHorizonal } from "lucide-react"
import ImageView from "../ui-components/ImageView"
import PostModal from "./PostModal"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

export default function PostCard({ post, token, liked, onLikeToggle, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(undefined)
  const [activeImageIndex, setActiveImageIndex] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

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

  const handleShare = () => {
    toast.success("Bài viết đã được chia sẻ (demo)!")
  }

  return (
    <Card className={`bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-sm ${padding} w-full ${className}`}>
      <div className={`flex items-center justify-between ${spacing}`}>
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
              {dayjs(post.createdAt).fromNow()}
            </p>
            {post.author?.mutualFriendsCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {post.author.mutualFriendsCount} bạn chung
              </p>
            )}
          </div>
        </div>

        <button className="text-xl text-[var(--muted-foreground)]">•••</button>
      </div>

      <p className={`${textSizes.content} ${spacing}`}>
        {post.content}
      </p>

      {Array.isArray(post.files) && post.files.length > 0 && (
        <ImageView images={post.files} token={token} onImageClick={(i) => setActiveImageIndex(i)} />
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

      {(activeImageIndex !== null || showModal) && (
        <PostModal
  post={post}
  liked={post.liked}
  likeCount={post.likeCount}
  token={token}
  activeIndex={activeImageIndex}
  onClose={() => setActiveImageIndex(null)}
  onLikeToggle={() => onLikeToggle(post.id)}
/>

      )}
    </Card>
  )
}
