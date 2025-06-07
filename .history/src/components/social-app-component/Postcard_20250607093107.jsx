"use client"

import { useEffect, useState } from "react"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, MessageCircle, SendHorizonal } from "lucide-react"
import ImageView from "../ui-components/ImageView"
import PostModal from "../social-app-component/PostModal"

export default function PostCard({ post, token, liked, onLikeToggle, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(undefined)
  const [activeImageIndex, setActiveImageIndex] = useState(null)
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

  return (
    <Card className={`bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-sm ${padding} w-full ${className}`}>
      <div className={`flex items-center justify-between ${spacing}`}>
        <div className="flex items-center gap-2">
          <Avatar src={post.author?.profilePictureUr;} alt={post.author?.username || ""} size={avatarSize} />
          <div>
            <p className={`font-semibold ${textSizes.username}`}>{post.author?.familyName +" "+ post.author?.givenName}</p>
            <p className={textSizes.time}>{new Date(post.createdAt).toLocaleString()}</p>
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
        <button><MessageCircle className="h-5 w-5" /></button>
        <button><SendHorizonal className="h-5 w-5" /></button>
      </div>

      <p className={textSizes.likes}>{post.likeCount} likes</p>

      {post.latestComment && (
        <div className={textSizes.comment}>
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      <button className={textSizes.viewAll}>
        View all {post.commentCount} comments
      </button>

      {activeImageIndex !== null && (
        <PostModal
          post={post}
          liked={liked}
          token ={token}
          activeIndex={activeImageIndex}
          onClose={() => setActiveImageIndex(null)}
          onLikeToggle={onLikeToggle}
        />
      )}
    </Card>
  )
}
