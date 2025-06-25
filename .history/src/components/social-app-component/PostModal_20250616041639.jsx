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
import { AnimatePresence, motion } from "framer-motion"

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

function isVideo(url = "") {
  return /\.(mp4|webm|ogg)$/i.test(url)
}

export default function PostModal({
  post,
  liked,
  likeCount,
  comments = [],
  loadingComments = false,
  activeIndex = 0,
  onClose,
  onLikeToggle,
}) {
  const media = post?.files || post?.images || []
  const [page, setPage] = useState({ index: activeIndex, direction: 0 })
  const [touchStartX, setTouchStartX] = useState(null)

  const showNext = () => {
    if (page.index < media.length - 1) {
      setPage({ index: page.index + 1, direction: 1 })
    }
  }

  const showPrev = () => {
    if (page.index > 0) {
      setPage({ index: page.index - 1, direction: -1 })
    }
  }

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX
    if (deltaX > 50) showPrev()
    else if (deltaX < -50) showNext()
    setTouchStartX(null)
  }

  const currentMedia = media[page.index]
  if (!Array.isArray(media) || !currentMedia) return null

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col md:flex-row w-full h-[90vh] bg-[var(--card)] text-[var(--card-foreground)] rounded-xl overflow-hidden">
        {/* Image/Video side */}
        <div
          className="relative w-full md:w-3/5 bg-black overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} custom={page.direction}>
            <motion.div
              key={page.index}
              className="absolute inset-0"
              custom={page.direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {isVideo(currentMedia) ? (
                <video
                  autoPlay
                  controls
                  className="w-full h-full object-contain"
                  src={currentMedia}
                />
              ) : (
                <Image
                  src={currentMedia}
                  alt={`Post media ${page.index + 1}`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {page.index > 0 && (
            <button
              className="absolute top-1/2 left-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
              onClick={showPrev}
            >
              <ChevronLeft />
            </button>
          )}

          {page.index < media.length - 1 && (
            <button
              className="absolute top-1/2 right-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
              onClick={showNext}
            >
              <ChevronRight />
            </button>
          )}
        </div>

        {/* Content side */}
        <div className="w-full md:w-2/5 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="flex-1 overflow-y-auto mb-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                src={post.author?.profilePictureUrl}
                alt={post.author?.username}
                size={36}
              />
              <div>
                <p className="font-semibold text-sm">
                  {post.author?.givenName || ""} {post.author?.familyName || ""}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm mb-4">{post.content}</p>

            {/* Actions */}
            <div className="flex gap-4 text-[var(--muted-foreground)] mb-2">
              <div>
                <button onClick={onLikeToggle}>
                  <Heart
                    className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
                  />
                </button>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  {likeCount} lượt thích
                </p>
              </div>
              <button>
                <MessageCircle className="h-5 w-5" />
              </button>
              <button>
                <SendHorizonal className="h-5 w-5" />
              </button>
            </div>

            {/* Comments */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold">Bình luận</p>
              {loadingComments ? (
                <p className="text-xs text-muted">Đang tải bình luận...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted">Chưa có bình luận nào</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold">{c.author.familyName+" "+c.author.givenName || "Người dùng"}</span>
                    <span className="ml-2">{c.content}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Input */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="border-t border-[var(--border)] pt-2 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Viết bình luận..."
              className="flex-1 bg-transparent outline-none text-sm p-2"
            />
            <button
              type="submit"
              className="text-blue-500 text-sm font-semibold hover:opacity-80"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
    </Modal>
  )
}
