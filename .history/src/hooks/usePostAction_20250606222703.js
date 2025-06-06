import { useCallback } from "react"
import api from "@/utils/axios"

export default function usePostActions({ posts, setPosts }) {
  const toggleLike = useCallback((postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post

        const liked = post.liked
        const updatedPost = {
          ...post,
          liked: !liked,
          likeCount: post.likeCount + (liked ? -1 : 1),
        }

        ;(async () => {
          try {
            if (liked) {
              await api.delete(`/v1/posts/unlike/${postId}`)
            } else {
              await api.post(`/v1/posts/like/${postId}`)
            }
          } catch (err) {
            console.error("Toggle like failed:", err)
          }
        })()

        return updatedPost
      })
    )
  }, [setPosts])

  return { toggleLike }
}
