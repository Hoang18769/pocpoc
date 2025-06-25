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
import FilePreviewInChat from "../ui-components/FilePreviewInChat"
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
  onCommentSubmit, // optional
  onCommentUpdate, // new prop to update comments when liked
}) {
  const media = post?.files || post?.images || []
  const [page, setPage] = useState({ index: activeIndex, direction: 0 })
  const [touchStartX, setTouchStartX] = useState(null)
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(comments)
  const [replyingTo, setReplyingTo] = useState(null) // commentId being replied to
  const [replyContent, setReplyContent] = useState("")
  const [replyFile, setReplyFile] = useState(null)
  const [replyPreviewUrl, setReplyPreviewUrl] = useState(null)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // Update local comments when comments prop changes
  useState(() => {
    setLocalComments(comments)
  }, [comments])

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
      
      // Update local comments
      setLocalComments(prev => [res.data, ...prev])
      
      setContent("")
      handleRemoveFile()
    } catch (err) {
      toast.error("Lỗi gửi bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentLike = async (commentId, isCurrentlyLiked) => {
    try {
      if (isCurrentlyLiked) {
        // Unlike the comment
        await api.delete(`/v1/comments/unlike/${commentId}`)
      } else {
        // Like the comment
        await api.post(`/v1/comments/like/${commentId}`)
      }

      // Update local state immediately for better UX
      setLocalComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? {
                ...comment,
                liked: !isCurrentlyLiked,
                likeCount: isCurrentlyLiked 
                  ? comment.likeCount - 1 
                  : comment.likeCount + 1
              }
            : comment
        )
      )

      // Notify parent component if callback exists
      if (onCommentUpdate) {
        onCommentUpdate(commentId, !isCurrentlyLiked)
      }

    } catch (err) {
      toast.error("Lỗi khi thích bình luận")
    }
  }

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId)
    setReplyContent("")
    setReplyFile(null)
    setReplyPreviewUrl(null)
  }

  const handleReplyCancel = () => {
    setReplyingTo(null)
    setReplyContent("")
    setReplyFile(null)
    setReplyPreviewUrl(null)
  }

  const handleReplyFileChange = (e) => {
    const f = e.target.files[0]
    if (f) {
      setReplyFile(f)
      setReplyPreviewUrl(URL.createObjectURL(f))
    }
  }

  const handleReplyFileRemove = () => {
    setReplyFile(null)
    setReplyPreviewUrl(null)
  }

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault()
    if (!replyContent.trim() && !replyFile) return

    try {
      setIsSubmittingReply(true)
      const formData = new FormData()
      formData.append("originalCommentId", commentId)
      formData.append("content", replyContent)
      if (replyFile) formData.append("file", replyFile)

      const res = await api.post(`/v1/comments/reply`, formData)
      
      // Update local comments - increment reply count
      setLocalComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replyCount: comment.replyCount + 1 }
            : comment
        )
      )

      // Reset reply form
      handleReplyCancel()
      
      toast.success("Đã trả lời bình luận")
    } catch (err) {
      toast.error("Lỗi khi trả lời bình luận")
      console.error("Error replying to comment:", err)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const currentMedia = media[page.index]
  if (!Array.isArray(media) || !currentMedia) return null

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col md:flex-row w-full h-[90vh] bg-[var(--card)] text-[var(--card-foreground)] rounded-xl overflow-hidden">
        {/* Media section */}
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

        {/* Content section */}
        <div className="w-full md:w-2/5 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="flex-1 overflow-y-auto mb-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                src={post.author?.profilePictureUrl}
                alt={post.author?.username}
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
                <p className="text-xs">{likeCount} lượt thích</p>
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
              ) : localComments.length === 0 ? (
                <p className="text-xs text-muted">Chưa có bình luận nào</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {localComments.map((c) => (
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
                              />
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                          <button 
                            className="hover:underline flex items-center gap-1 transition-colors"
                            onClick={() => handleCommentLike(c.id, c.liked)}
                          >
                            <Heart
                              size={14}
                              className={c.liked ? "fill-red-500 text-red-500" : "hover:text-red-500"}
                            />
                            {c.likeCount}
                          </button>
                          <button 
                            className="hover:underline flex items-center gap-1"
                            onClick={() => handleReplyClick(c.id)}
                          >
                            <MessageCircle size={14} />
                            {c.replyCount}
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === c.id && (
                          <div className="mt-3 pl-4 border-l-2 border-[var(--border)]">
                            {/* Reply File Preview */}
                            {replyFile && (
                              <div className="mb-2">
                                <FilePreviewInChat
                                  selectedFile={replyFile}
                                  filePreview={replyPreviewUrl}
                                  onCancel={handleReplyFileRemove}
                                />
                              </div>
                            )}

                            {/* Reply Input Form */}
                            <form
                              onSubmit={(e) => handleReplySubmit(e, c.id)}
                              className="flex flex-col gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder={`Trả lời ${c.author?.givenName}...`}
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                  autoFocus
                                />
                                <label className="text-xs text-blue-500 cursor-pointer hover:underline">
                                  + File
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
                                    hidden
                                    onChange={handleReplyFileChange}
                                  />
                                </label>
                              </div>
                              
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={handleReplyCancel}
                                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSubmittingReply || (!replyContent.trim() && !replyFile)}
                                  className="text-xs text-blue-500 font-semibold hover:opacity-80 disabled:opacity-50"
                                >
                                  {isSubmittingReply ? "Đang gửi..." : "Trả lời"}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Preview */}
          {file && (
            <FilePreviewInChat
              selectedFile={file}
              filePreview={previewUrl}
              onCancel={handleRemoveFile}
            />
          )}

          {/* Comment input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--border)] pt-2 flex items-center gap-2 p-2"
          >
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
          </form>
        </div>
      </div>
    </Modal>
  )
}