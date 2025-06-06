"use client"

import Image from "next/image"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  SendHorizonal,
} from "lucide-react"
import Avatar from "../ui-components/Avatar"
import Modal from "../ui-components/Modal"

export default function PostModal({ post, liked, activeIndex, onClose, onLikeToggle }) {
  const images = post?.files || post?.images || []
  const [index, setIndex] = useState(activeIndex || 0)
  const [touchStartX, setTouchStartX] = useState(null)
  const [liked, setLiked] = useState(post?.liked || false)

  useEffect(() => {
  setLiked(post?.liked || false)
}, [post])
  const showNext = () => {
    if (index < images.length - 1) setIndex(index + 1)
  }

  const showPrev = () => {
    if (index > 0) setIndex(index - 1)
  }

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX
    if (deltaX > 50) showPrev()
    else if (deltaX < -50) showNext()
    setTouchStartX(null)
  }

  const toggleLike = () => {
    setLiked(!liked)
    // TODO: Gọi API like/unlike tại đây nếu cần
  }

  if (!Array.isArray(images) || !images[index]) return null

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col md:flex-row w-full h-[90vh] bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
        {/* Image side */}
        <div
          className="relative w-full md:w-3/5 bg-black"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[index]}
            alt={`Post image ${index + 1}`}
            fill
            unoptimized
            className="object-contain"
          />

          {index > 0 && (
            <button
              className="absolute top-1/2 left-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={showPrev}
            >
              <ChevronLeft />
            </button>
          )}

          {index < images.length - 1 && (
            <button
              className="absolute top-1/2 right-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={showNext}
            >
              <ChevronRight />
            </button>
          )}
        </div>

        {/* Content side */}
        <div className="w-full md:w-2/5 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="overflow-y-auto flex-1 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={post.user?.avatar} alt={post.user?.name} size={36} />
              <div>
                <p className="font-semibold text-sm">{post.user?.name}</p>
                <p className="text-xs text-muted">{post.time}</p>
              </div>
            </div>

            <p className="text-sm mb-4">{post.content}</p>

            <div className="flex mt-3 gap-4 text-[color:var(--muted-foreground)]">
<button onClick={onLikeToggle}>
  <Heart
    className={`h-5 w-5 transition-colors ${
      liked ? "text-red-500 fill-red-500" : ""
    }`}
  />
</button>
              <button><MessageCircle className="h-5 w-5" /></button>
              <button><SendHorizonal className="h-5 w-5" /></button>
            </div>

            <p className="text-xs text-muted mb-2">{post.likeCount} likes</p>

            {post.latestComment && (
              <div className="text-sm mb-2">
                <span className="font-semibold">{post.latestComment.user}</span>
                <span className="ml-2">{post.latestComment.content}</span>
              </div>
            )}

            <button className="text-sm text-muted hover:underline mb-4">
              View all {post.totalComments} comments
            </button>
          </div>

          <form
            className="border-t border-gray-300 dark:border-neutral-700 pt-2 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              // TODO: handle comment submit
            }}
          >
            <input
              type="text"
              placeholder="Thêm bình luận..."
              className="flex-1 bg-transparent outline-none text-sm p-2"
            />
            <button
              type="submit"
              className="text-blue-500 text-sm font-semibold hover:opacity-80"
            >
              Đăng
            </button>
          </form>
        </div>
      </div>
    </Modal>
  )
}
