"use client"

import Image from "next/image"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  SendHorizonal,
  X,
} from "lucide-react"
import Avatar from "../ui-components/Avatar"
import Modal from "../ui-components/Modal"
import { AnimatePresence, motion } from "framer-motion"
import dayjs from "dayjs"
import api from "@/utils/axios"
import toast from "react-hot-toast"

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
  onCommentSubmit,
}) {
  const media = post?.files || post?.images || []
  const [page, setPage] = useState({ index: activeIndex, direction: 0 })
  const [touchStartX, setTouchStartX] = useState(null)
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentLikes, setCommentLikes] = useState(() =>
    comments.reduce((acc, c) => {
      acc[c.id] = c.liked
      return acc
    }, {})
  )

  const [commentLikeCounts, setCommentLikeCounts] = useState(() =>
    comments.reduce((acc, c) => {
      acc[c.id] = c.likeCount
      return acc
    }, {})
  )

  const toggleCommentLike = async (commentId) => {
    try {
      const liked = commentLikes[commentId]
      if (liked) {
        await api.delete(`/v1/comments/unlie/${commentId}`)
        setCommentLikes((prev) => ({ ...prev, [commentId]: false }))
        setCommentLikeCounts((prev) => ({ ...prev, [commentId]: prev[commentId] - 1 }))
      } else {
        await api.post(`/v1/comments/like/${commentId}`)
        setCommentLikes((prev) => ({ ...prev, [commentId]: true }))
        setCommentLikeCounts((prev) => ({ ...prev, [commentId]: prev[commentId] + 1 }))
      }
    } catch (error) {
      toast.error("Lỗi khi xử lý thích bình luận")
    }
  }

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

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      setPreviewUrl(URL.createObjectURL(f))
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !file) return

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append("content", content)
      formData.append("postId", post.id)
      if (file) formData.append("file", file)

      const res = await api.post("/v1/comments", formData)
      if (onCommentSubmit) onCommentSubmit(res.data)
      setContent("")
      handleRemoveFile()
    } catch (err) {
      toast.error("Lỗi gửi bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentMedia = media[page.index]
  if (!Array.isArray(media) || !currentMedia) return null

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col md:flex-row w-full h-[90vh] bg-[var(--card)] text-[var(--card-foreground)] rounded-xl overflow-hidden">
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

        <div className="w-full md:w-2/5 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                src={post.author?.profilePictureUrl}
                alt={post.author?.username}
                size={36}
              />
              <div>
                <p className="font-semibold text-sm">
                  {post.author?.givenName} {post.author?.familyName}
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
                    className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
                  />
                </button>
                <p className="text-xs">{likeCount} lượt thích</p>
              </div>
              <button>
                <MessageCircle className="h-5 w-5" />
              </button>
              <button>
                <SendHorizonal className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold">Bình luận</p>
              {loadingComments ? (
                <p className="text-xs text-muted">Đang tải bình luận...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted">Chưa có bình luận nào</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3 text-sm">
                      <Avatar
                        src={c.author?.profilePictureUrl}
                        alt={c.author?.username}
                        size={32}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold">
                            {c.author?.givenName} {c.author?.familyName}
                          </p>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {dayjs(c.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{c.content}</p>
                        {c.fileUrl && (
                          <div className="mb-1">
                            {isVideo(c.fileUrl) ? (
                              <video
                                controls
                                className="rounded-lg max-h-60 w-full object-contain"
                                src={c.fileUrl}
                              />
                            ) : (
                              <Image
                                src={c.fileUrl}
                                alt="comment media"
                                width={300}
                                height={200}
                                className="rounded-lg max-h-60 w-auto object-contain"
                                unoptimized
                              />
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                          <button
                            className="hover:underline flex items-center gap-1"
                            onClick={() => toggleCommentLike(c.id)}
                          >
                            <Heart
                              size={14}
                              className={commentLikes[c.id] ? "fill-red-500 text-red-500" : ""}
                            />
                            {commentLikeCounts[c.id] || 0}
                          </button>
                          <button className="hover:underline flex items-center gap-1">
                            <MessageCircle size={14} />
                            {c.replyCount}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--border)] pt-2 flex flex-col gap-2"
          >
            {previewUrl && (
              <div className="relative w-fit">
                {isVideo(previewUrl) ? (
                  <video
                    src={previewUrl}
                    className="max-h-40 rounded-lg"
                    controls
                  />
                ) : (
                  <Image
                    src={previewUrl}
                    alt="preview"
                    width={200}
                    height={120}
                    className="rounded-lg"
                    unoptimized
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm p-2"
              />
              <label className="text-sm text-blue-500 cursor-pointer hover:underline">
                + Ảnh
                <input
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={handleFileChange}
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-blue-500 text-sm font-semibold hover:opacity-80"
              >
                Gửi
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}