import { useCallback, useRef } from "react"
import api from "@/utils/axios"

export default function usePostActions({ posts, setPosts }) {
  const isLikingRef = useRef({})

  const toggleLike = useCallback((postId) => {
    if (isLikingRef.current[postId]) return // ⛔ Đang xử lý, chặn click tiếp

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post

        const liked = post.liked
        return {
          ...post,
          liked: !liked,
          likeCount: post.likeCount + (liked ? -1 : 1),
        }
      })
    )

    isLikingRef.current[postId] = true

    ;(async () => {
      try {
        const post = posts.find((p) => p.id === postId)
        if (!post) return

        if (post.liked) {
          await api.delete(`/v1/posts/unlike/${postId}`)
        } else {
          await api.post(`/v1/posts/like/${postId}`)
        }
      } catch (err) {
        console.error("❌ Toggle like failed:", err)
        // Rollback nếu lỗi
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id !== postId) return post

            const liked = post.liked
            return {
              ...post,
              liked: !liked,
              likeCount: post.likeCount + (liked ? -1 : 1),
            }
          })
        )
      } finally {
        isLikingRef.current[postId] = false
      }
    })()
  }, [posts, setPosts])

  return { toggleLike }
}
