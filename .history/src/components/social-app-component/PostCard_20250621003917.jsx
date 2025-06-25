"use client"

import { useEffect, useState } from "react"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"
import { Heart, MessageCircle, SendHorizonal, MoreVertical, Share2 } from "lucide-react"
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
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [originalPostData, setOriginalPostData] = useState(null)
  const [loadingOriginalPost, setLoadingOriginalPost] = useState(false)
const [showShareModal, setShowShareModal] = useState(false)
const [shareContent, setShareContent] = useState("")
const [sharePrivacy, setSharePrivacy] = useState("FRIEND")
const [isSharing, setIsSharing] = useState(false)

  const router = useRouter()
  const isModalOpen = activeImageIndex !== null || showModal
  
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 640)
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    if (isModalOpen) {
      if (post.sharedPost) {
        fetchOriginalPost()
      } else {
        fetchComments()
      }
    }
  }, [isModalOpen])

  const fetchOriginalPost = async () => {
    if (loadingOriginalPost || originalPostData) return
    setLoadingOriginalPost(true)
    try {
      const res = await api.get(`/v1/posts/${post.originalPost.id}`)
      setOriginalPostData(res.data.body)
      // Also fetch comments for the original post
      fetchCommentsForPost(post.originalPost.id)
    } catch (err) {
      toast.error("Không thể tải bài viết gốc")
      console.error(err)
    } finally {
      setLoadingOriginalPost(false)
    }
  }

  const fetchComments = async () => {
    if (loadingComments || comments.length > 0) return
    fetchCommentsForPost(post.id)
  }

  const fetchCommentsForPost = async (postId) => {
    if (loadingComments || comments.length > 0) return
    setLoadingComments(true)
    try {
      const res = await api.get(`/v1/comments/of-post/${postId}`, {
        params: { page: 0, size: 50 }
      })
      console.log(res)
      setComments(res.data.body || [])
    } catch (err) {
      toast.error("Không thể tải bình luận")
      console.error(err)
    } finally {
      setLoadingComments(false)
    }
  }

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
            params: { privacy: newPrivacy }
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

const handleShare = (e) => {
  setShowShareModal(true)
}
const handleSharePost = async () => {
  if (isSharing) return
  setIsSharing(true)
  try {
    await api.post("/v1/posts/share", {
      content: shareContent,
      privacy: sharePrivacy,
      originalPostId: post.id,
    })
    toast.success("Chia sẻ bài viết thành công!")
    setShowShareModal(false)
    setShareContent("")
    setSharePrivacy("FRIEND")
  } catch (err) {
    toast.error("Lỗi khi chia sẻ bài viết!")
    console.error(err)
  } finally {
    setIsSharing(false)
  }
}


  // Function to open modal - unified logic
  const openModal = () => {
    setShowModal(true)
    if (post.sharedPost) {
      fetchOriginalPost()
    } else {
      fetchComments()
    }
  }

  const handleCardClick = (e) => {
    // Không mở modal nếu đang click vào button hoặc đang trong mode edit
    if (editing || e.target.closest('button') || e.target.closest('select') || e.target.closest('textarea')) {
      return
    }
    openModal()
  }

  const handleProfileClick = (e) => {
    e.stopPropagation() // Ngăn không cho bubble up tới card click
    router.push(`/profile/${post.author?.username}`)
  }

  const handleOriginalProfileClick = (e) => {
    e.stopPropagation()
    router.push(`/profile/${post.originalPost?.author?.username}`)
  }

  // Handler for MessageCircle button
  const handleMessageCircleClick = (e) => {
    e.stopPropagation()
    openModal()
  }

  const renderPrivacyIcon = (privacy) => {
    switch (privacy) {
      case "PUBLIC": return "🌍"
      case "FRIEND": return "👥"
      case "PRIVATE": return "🔒"
      default: return ""
    }
  }

  const renderSharedPostContent = () => {
    if (!post.sharedPost) return null

    if (!post.originalPostCanView) {
      return (
        <div className="mt-3 p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]/50">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[var(--muted-foreground)]">
              Bài viết hiện không khả dụng
            </p>
          </div>
        </div>
      )
    }

    else {
      return (
      <div className="mt-3 p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]/50">
        {/* Original post author info */}
        <div className="flex items-center gap-2 mb-3 cursor-pointer hover:underline" onClick={handleOriginalProfileClick}>
          <Avatar
            src={post.originalPost.author?.profilePictureUrl}
            alt={post.originalPost.author?.username || ""}
            size={32}
          />
          <div>
            <p className="font-semibold text-sm text-[var(--card-foreground)]">
              {post.originalPost.author?.familyName + " " + post.originalPost.author?.givenName}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {dayjs(post.originalPost.createdAt).fromNow()} {renderPrivacyIcon(post.originalPost.privacy)}
            </p>
          </div>
        </div>

        {/* Original post content */}
        {post.originalPost.content && (
          <p className="text-sm text-[var(--card-foreground)] mb-3">
            {post.originalPost.content}
          </p>
        )}

        {/* Original post images */}
        {Array.isArray(post.originalPost.files) && post.originalPost.files.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <ImageView
              images={post.originalPost.files}
              isActive={!isModalOpen}
              onImageClick={(i) => {
                setActiveImageIndex(i)
                setShowModal(true)
              }}
            />
          </div>
        )}
      </div>
    )
    }
    
  }

  // For shared posts, we need to use the fetched original post data which has complete interaction info
  const getPostForModal = () => {
    if (post.sharedPost && originalPostData) {
      return originalPostData
    }
    return post
  }

  const getPostForInteractions = () => {
    if (post.sharedPost && originalPostData) {
      return originalPostData
    }
    return post.sharedPost ? post.originalPost : post
  }

  return (
    <Card 
      className={`bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-sm ${padding} w-full ${className} cursor-pointer hover:bg-[var(--card)]/90 transition-colors`}
      onClick={handleCardClick}
    >
      <div className={`flex items-start justify-between ${spacing} relative`}>
        <div
          className="flex items-center gap-2 cursor-pointer hover:underline"
          onClick={handleProfileClick}
        >
          <Avatar
            src={post.author?.profilePictureUrl}
            alt={post.author?.username || ""}
            size={avatarSize}
          />
          <div>
            <p className={`font-semibold ${textSizes.username}`}>
              {post.author?.familyName + " " + post.author?.givenName}
              {post.sharedPost && (
                <>
                  {" đã chia sẻ một bài viết"}
                  <Share2 className="inline w-4 h-4 ml-1 text-[var(--muted-foreground)]" />
                </>
              )}
            </p>
            <p className={textSizes.time}>
              {dayjs(post.createdAt).fromNow()} {renderPrivacyIcon(post.privacy)}
            </p>
            {post.author?.mutualFriendsCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {post.author.mutualFriendsCount} bạn chung
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setShowOptions(!showOptions)
            }} 
            className="text-xl text-[var(--muted-foreground)] hover:bg-[var(--input)] rounded-full p-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[var(--background)] border rounded shadow z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit()
                }} 
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--input)]"
              >
                ✏️ Chỉnh sửa
              </button>
              <button 
                onClick={(e) => e.stopPropagation()} 
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--input)]"
              >
                🗑️ Xóa
              </button>
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
            <option value="FRIEND">👥 Bạn bè</option>
            <option value="PRIVATE">🔒 Chỉ mình tôi</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSaveEdit()
              }}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "💾 Lưu"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditing(false)
              }}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[var(--input)] disabled:opacity-50"
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Current post content (share comment) */}
          {post.content && (
            <div  onClick={(e) => {
          e.stopPropagation()
          openModal()
        }}
            >
<p className={`${textSizes.content} ${spacing}`}>
              {post.content}
            </p>
            </div>
          )}
          
          {/* Shared post content */}
          {renderSharedPostContent()}
          
          {/* Current post images (if not a shared post) */}
          {!post.sharedPost && Array.isArray(post.files) && post.files.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <ImageView
                images={post.files}
                isActive={!isModalOpen}
                onImageClick={(i) => {
                  setActiveImageIndex(i)
                  setShowModal(true)
                }}
              />
            </div>
          )}
        </>
      )}

      <div className="flex mt-3 gap-4 text-[var(--muted-foreground)]">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onLikeToggle()
          }} 
          className="p-2 rounded-full hover:bg-[var(--input)]"
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        <button 
          onClick={handleMessageCircleClick}
          className="p-2 rounded-full hover:bg-[var(--input)]"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            handleShare()
          }}
          className="p-2 rounded-full hover:bg-[var(--input)]"
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>

      <p className={textSizes.likes}>
        { post.likeCount} lượt thích
      </p>

      {(post.sharedPost ? (originalPostData?.latestComment || post.originalPost?.latestComment) : post.latestComment) && (
        <div className={textSizes.comment}>
          <span className="font-semibold">
            {post.sharedPost ? 
              (originalPostData?.latestComment?.user || post.originalPost?.latestComment?.user) : 
              post.latestComment?.user}
          </span>
          <span className="ml-2">
            {post.sharedPost ? 
              (originalPostData?.latestComment?.content || post.originalPost?.latestComment?.content) : 
              post.latestComment?.content}
          </span>
        </div>
      )}

      <button
        className={textSizes.viewAll}
        onClick={(e) => {
          e.stopPropagation()
          openModal()
        }}
      >
        Xem tất cả {post.sharedPost ? (originalPostData?.commentCount || post.originalPost?.commentCount || 0) : post.commentCount} bình luận
      </button>

      {isModalOpen && (
        <PostModal
          post={getPostForModal()}
          liked={post.sharedPost ? (originalPostData?.liked || false) : liked}
          likeCount={post.sharedPost ? (originalPostData?.likeCount || 0) : post.likeCount}
          activeIndex={activeImageIndex}
          comments={comments}
          loadingComments={loadingComments || loadingOriginalPost}
          onFetchComments={post.sharedPost ? () => fetchCommentsForPost(post.originalPost.id) : fetchComments}
          onClose={() => {
            setActiveImageIndex(null)
            setShowModal(false)
            // Reset original post data to allow fresh fetch next time
            if (post.sharedPost) {
              setOriginalPostData(null)
              setComments([])
            }
          }}
          onLikeToggle={() => onLikeToggle(post.sharedPost ? post.originalPost.id : post.id)}
        />
      )}
      {showShareModal && (
  <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)}>
    <div className="p-4 w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Chia sẻ bài viết</h2>

      <label className="block text-sm mb-1">Privacy</label>
      <select
        className="w-full mb-3 p-2 border rounded"
        value={sharePrivacy}
        onChange={(e) => setSharePrivacy(e.target.value)}
      >
        <option value="PUBLIC">🌍 Public</option>
        <option value="FRIEND">👥 Friends</option>
        <option value="PRIVATE">🔒 Only me</option>
      </select>

      <label className="block text-sm mb-1">Bạn muốn nói gì không?</label>
      <textarea
        className="w-full mb-3 p-2 border rounded resize-none"
        placeholder="Viết điều gì đó..."
        rows={3}
        value={shareContent}
        onChange={(e) => setShareContent(e.target.value)}
      />

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowShareModal(false)}
          className="px-3 py-1 border rounded"
          disabled={isSharing}
        >Hủy</button>
        <button
          onClick={handleSharePost}
          className="px-3 py-1 bg-[var(--primary)] text-white rounded disabled:opacity-50"
          disabled={isSharing}
        >{isSharing ? "Đang chia sẻ..." : "Chia sẻ"}</button>
      </div>
    </div>
  </Modal>
)}

    </Card>
  )
}