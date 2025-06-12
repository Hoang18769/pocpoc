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
import { AnimatePresence } from "framer-motion"

import Avatar from "../ui-components/Avatar"
import Modal from "../ui-components/Modal"
import MotionContainer from "../ui-components/MotionContainer"

export default function PostModal({
  post,
  liked,
  likeCount,
  activeIndex = 0,
  onClose,
  onLikeToggle,
}) {
  const images = post?.files || post?.images || []
  const [page, setPage] = useState({ index: activeIndex, direction: 0 })
  const [touchStartX, setTouchStartX] = useState(null)

  const showNext = () => {
    if (page.index < images.length - 1) {
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

  if (!Array.isArray(images) || !images[page.index]) return null

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col md:flex-row w-full h-[90vh] bg-[var(--card)] text-[var(--card-foreground)] rounded-xl overflow-hidden">
        {/* Image side */}
        <div
          className="relative w-full md:w-3/5 bg-black overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
         <AnimatePresence mode="wait" initial={false}>
  <MotionContainer
    key={page.index}
    modeKey={page.index}
    effect="slideHorizontal"
    direction={page.direction}
    duration={0.25}
    className="absolute inset-0"
  >
    <Image
      src={images[page.index]}
      alt={`Image ${page.index + 1}`}
      fill
      className="object-contain"
      unoptimized
    />
  </MotionContainer>
</AnimatePresence>


          {page.index > 0 && (
            <button
              className="absolute top-1/2 left-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={showPrev}
            >
              <ChevronLeft />
            </button>
          )}

          {page.index < images.length - 1 && (
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
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                src={post.author?.profilePictureUrl}
                alt={post.author?.userName}
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

            <p className="text-sm mb-4">{post.content}</p>

            <div className="flex gap-4 text-[var(--muted-foreground)] mb-2">
              <div>
                <button onClick={onLikeToggle}>
                  <Heart
                    className={`h-5 w-5 ${
                      liked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  {likeCount} likes
                </p>
              </div>
              <button>
                <MessageCircle className="h-5 w-5" />
              </button>
              <button>
                <SendHorizonal className="h-5 w-5" />
              </button>
            </div>

            {post.latestComment && (
              <div className="text-sm mb-2">
                <span className="font-semibold">{post.latestComment.user}</span>
                <span className="ml-2">{post.latestComment.content}</span>
              </div>
            )}

            <button className="text-sm text-[var(--muted-foreground)] hover:underline mb-4">
              View all {post.totalComments} comments
            </button>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="border-t border-[var(--border)] pt-2 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-transparent outline-none text-sm p-2"
            />
            <button
              type="submit"
              className="text-blue-500 text-sm font-semibold hover:opacity-80"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </Modal>
  )
}
