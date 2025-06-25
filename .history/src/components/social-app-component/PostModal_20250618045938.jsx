const handleSubmit = async (e) => {
    e.preventDefault()
    "use client"

import Image from "next/image"
import { useState, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  SendHorizonal,
  ChevronDown,
  ChevronUp,
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

const isVideo = (url = "") => /\.(mp4|webm|ogg)$/i.test(url)

// File Input Component
const FileInput = ({ onChange, label = "+ File", accept = "image/*,video/*" }) => (
  <label className="text-xs text-blue-500 cursor-pointer hover:underline">
    {label}
    <input type="file" accept={accept} hidden onChange={onChange} />
  </label>
)

// Media Display Component
const MediaDisplay = ({ url, alt, className = "" }) => (
  isVideo(url) ? (
    <video
      controls
      className={`rounded-lg max-h-60 w-full object-contain ${className}`}
      src={url}
    />
  ) : (
    <Image
      src={url}
      alt={alt}
      width={300}
      height={200}
      className={`rounded-lg max-h-60 w-auto object-contain ${className}`}
    />
  )
)

// Like Button Component
const LikeButton = ({ liked, likeCount, onClick, size = 14 }) => (
  <button 
    className="hover:underline flex items-center gap-1 transition-colors"
    onClick={onClick}
  >
    <Heart
      size={size}
      className={liked ? "fill-red-500 text-red-500" : "hover:text-red-500"}
    />
    {likeCount}
  </button>
)

// Reply Button Component
const ReplyButton = ({ replyCount, onClick, size = 14 }) => (
  <button 
    className="hover:underline flex items-center gap-1"
    onClick={onClick}
  >
    <MessageCircle size={size} />
    {replyCount}
  </button>
)

// Comment Form Component
const CommentForm = ({ 
  onSubmit, 
  content, 
  setContent, 
  file, 
  previewUrl, 
  onFileChange, 
  onFileRemove, 
  isSubmitting, 
  placeholder = "Viết bình luận...",
  buttonText = "Gửi",
  onCancel = null
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }
  
  return (
    <div>
      {file && (
        <div className="mb-2">
          <FilePreviewInChat
            selectedFile={file}
            filePreview={previewUrl}
            onCancel={onFileRemove}
          />
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            autoFocus={!!onCancel}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isSubmitting && (content.trim() || file)) {
                  handleSubmit(e)
                }
              }
            }}
          />
          <FileInput onChange={onFileChange} />
        </div>
        
        <div className="flex items-center gap-2 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Hủy
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !file)}
            className="text-xs text-blue-500 font-semibold hover:opacity-80 disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Reply Component
const Reply = ({ reply, onLike }) => (
  <div className="flex gap-2 text-sm pl-4 border-l-2 border-[var(--border)] ml-4">
    <Avatar
      src={reply.author?.profilePictureUrl}
      alt={reply.author?.username}
      size={24}
    />
    <div className="flex-1">
      <div className="flex justify-between">
        <p className="font-semibold text-xs">
          {reply.author?.givenName} {reply.author?.familyName}
        </p>
        <span className="text-xs text-[var(--muted-foreground)]">
          {dayjs(reply.createdAt).fromNow()}
        </span>
      </div>
      <p className="text-xs mb-1">{reply.content}</p>
      {reply.fileUrl && (
        <div className="mb-1">
          <MediaDisplay url={reply.fileUrl} alt="reply media" />
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
        <LikeButton
          liked={reply.liked}
          likeCount={reply.likeCount}
          onClick={() => onLike(reply.id, reply.liked)}
          size={12}
        />
      </div>
    </div>
  </div>
)

// Comment Component
const Comment = ({ 
  comment, 
  onLike, 
  onReplyClick, 
  replyingTo, 
  onReplySubmit, 
  onReplyCancel,
  replyForm
}) => {
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const handleShowReplies = useCallback(async () => {
    if (!showReplies && comment.replyCount > 0) {
      try {
        setLoadingReplies(true)
        const response = await api.get(`/v1/comments/of-comment/${comment.id}`)
        setReplies(response.data)
      } catch (error) {
        toast.error("Lỗi khi tải trả lời")
        console.error("Error loading replies:", error)
      } finally {
        setLoadingReplies(false)
      }
    }
    setShowReplies(!showReplies)
  }, [showReplies, comment.id, comment.replyCount])

  const handleReplyLike = useCallback(async (replyId, isCurrentlyLiked) => {
    try {
      if (isCurrentlyLiked) {
        await api.delete(`/v1/comments/unlike/${replyId}`)
      } else {
        await api.post(`/v1/comments/like/${replyId}`)
      }

      setReplies(prev => 
        prev.map(reply => 
          reply.id === replyId 
            ? {
                ...reply,
                liked: !isCurrentlyLiked,
                likeCount: isCurrentlyLiked 
                  ? reply.likeCount - 1 
                  : reply.likeCount + 1
              }
            : reply
        )
      )
    } catch (err) {
      toast.error("Lỗi khi thích trả lời")
    }
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-sm">
        <Avatar
          src={comment.author?.profilePictureUrl}
          alt={comment.author?.username}
          size={32}
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="font-semibold">
              {comment.author?.givenName} {comment.author?.familyName}
            </p>
            <span className="text-xs text-[var(--muted-foreground)]">
              {dayjs(comment.createdAt).fromNow()}
            </span>
          </div>
          <p className="text-sm mb-1">{comment.content}</p>
          {comment.fileUrl && (
            <div className="mb-1">
              <MediaDisplay url={comment.fileUrl} alt="comment media" />
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
            <LikeButton
              liked={comment.liked}
              likeCount={comment.likeCount}
              onClick={() => onLike(comment.id, comment.liked)}
            />
            <ReplyButton
              replyCount={comment.replyCount}
              onClick={() => onReplyClick(comment.id)}
            />
            {comment.replyCount > 0 && (
              <button 
                className="hover:underline flex items-center gap-1"
                onClick={handleShowReplies}
              >
                {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showReplies ? 'Ẩn' : 'Xem'} trả lời
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 pl-4 border-l-2 border-[var(--border)]">
              <CommentForm
                onSubmit={(e) => onReplySubmit(e, comment.id)}
                content={replyForm.content}
                setContent={replyForm.setContent}
                file={replyForm.file}
                previewUrl={replyForm.previewUrl}
                onFileChange={replyForm.onFileChange}
                onFileRemove={replyForm.onFileRemove}
                isSubmitting={replyForm.isSubmitting}
                placeholder={`Trả lời ${comment.author?.givenName}...`}
                buttonText="Trả lời"
                onCancel={onReplyCancel}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="space-y-2">
          {loadingReplies ? (
            <p className="text-xs text-muted ml-4">Đang tải trả lời...</p>
          ) : (
            replies.map((reply) => (
              <Reply
                key={reply.id}
                reply={reply}
                onLike={handleReplyLike}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
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
  onCommentUpdate,
}) {
  const media = post?.files || post?.images || []
  const [page, setPage] = useState({ index: activeIndex, direction: 0 })
  const [touchStartX, setTouchStartX] = useState(null)
  
  // Main comment form state
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Local comments state
  const [localComments, setLocalComments] = useState(comments)
  
  // Reply form state
  const [replyingTo, setReplyingTo] = useState(null)
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
        await api.delete(`/v1/comments/unlike/${commentId}`)
      } else {
        await api.post(`/v1/comments/like/${commentId}`)
      }

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
      
      setLocalComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replyCount: comment.replyCount + 1 }
            : comment
        )
      )

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

  const replyForm = {
    content: replyContent,
    setContent: setReplyContent,
    file: replyFile,
    previewUrl: replyPreviewUrl,
    onFileChange: handleReplyFileChange,
    onFileRemove: handleReplyFileRemove,
    isSubmitting: isSubmittingReply
  }

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
                  {localComments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onLike={handleCommentLike}
                      onReplyClick={handleReplyClick}
                      replyingTo={replyingTo}
                      onReplySubmit={handleReplySubmit}
                      onReplyCancel={handleReplyCancel}
                      replyForm={replyForm}
                    />
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
          <div className="border-t border-[var(--border)] pt-2 p-2">
            <CommentForm
              onSubmit={handleSubmit}
              content={content}
              setContent={setContent}
              file={file}
              previewUrl={previewUrl}
              onFileChange={handleFileChange}
              onFileRemove={handleRemoveFile}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}