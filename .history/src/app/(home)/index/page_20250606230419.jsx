"use client"

import { useEffect, useState } from "react"
import PostCard from "@/components/social-app-component/Postcard"
import api from "@/utils/axios" // custom axios đã dùng interceptor
import toast from "react-hot-toast"

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewsfeed = async () => {
      try {
        const res = await api.get("/v1/posts/newsfeed")
        setPosts(res.data.body || []) // đảm bảo fallback nếu `data` không có
      } catch (err) {
        console.error("Failed to fetch newsfeed:", err)
        toast.error("Failed to load posts.")
      } finally {
        setLoading(false)
      }
    }

    fetchNewsfeed()
  }, [])

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  if (loading) {
    return (
      <main className="p-6 flex justify-center">
        <p className="text-muted-foreground">Loading posts...</p>
      </main>
    )
  }

  return (
    <main className="p-6 space-y-6 flex flex-col items-center">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={!!likedPosts[post.id]}
            onLikeToggle={() => toggleLike(post.id)}
          />
        ))
      ) : (
        <p className="text-muted-foreground">No posts found.</p>
      )}
    </main>
  )
}
