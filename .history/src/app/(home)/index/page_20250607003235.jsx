"use client"

import { useEffect, useState } from "react"
import PostCard from "@/components/social-app-component/Postcard"
import api from "@/utils/axios"
import toast from "react-hot-toast"
import usePostActions from "@/hooks/usePostAction"

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : ""

  const { toggleLike } = usePostActions({ posts, setPosts })

  useEffect(() => {
    const fetchNewsfeed = async () => {
      try {
        const res = await api.get("/v1/posts/newsfeed")
        setPosts(res.data.body || [])
        console.log(res.data.body)
      } catch (err) {
        console.error("Failed to fetch newsfeed:", err)
        toast.error("Failed to load posts.")
      } finally {
        setLoading(false)
      }
    }

    fetchNewsfeed()
  }, [])

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
    posts
      .slice()                // tạo bản sao để không ảnh hưởng mảng gốc
      .reverse()             // đảo ngược thứ tự
      .map((post) => (
        <PostCard
          key={post.id}
          post={post}
          liked={post.liked}
          likeCount={post.likeCount}
          onLikeToggle={() => toggleLike(post.id)}
        />
      ))
  ) : (
    <p className="text-gray-500">Chưa có bài viết nào.</p>
  )}

    </main>
  )
}
