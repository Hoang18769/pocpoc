"use client"
import { useEffect, useState, useCallback } from "react"
import PostCard from "@/components/social-app-component/PostCard"
import api from "@/utils/axios"
import toast from "react-hot-toast"
import usePostActions from "@/hooks/usePostAction"

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)
  
  const LIMIT = 20
  const { toggleLike } = usePostActions({ posts, setPosts })

  // Fetch posts function
  const fetchPosts = useCallback(async (skipValue = 0, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const res = await api.get(`/v1/posts/newsfeed?skip=${skipValue}&limit=${LIMIT}`)
      const newPosts = res.data.body || []
      
      // If no new posts or less than LIMIT, no more data
      if (newPosts.length === 0 || newPosts.length < LIMIT) {
        setHasMore(false)
      }

      if (isLoadMore) {
        // Append new posts to existing ones
        setPosts(prevPosts => [...prevPosts, ...newPosts])
      } else {
        // Replace posts (initial load)
        setPosts(newPosts)
      }
      
      console.log(`Loaded ${newPosts.length} posts, skip: ${skipValue}`)
    } catch (err) {
      console.error("Failed to fetch newsfeed:", err)
      toast.error("Failed to load posts.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchPosts(0, false)
  }, [fetchPosts])

  // Infinity scroll handler
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
    const clientHeight = document.documentElement.clientHeight || window.innerHeight
    
    // Load more when user scrolls to bottom (with 100px buffer)
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      const newSkip = skip + LIMIT
      setSkip(newSkip)
      fetchPosts(newSkip, true)
    }
  }, [loadingMore, hasMore, skip, fetchPosts])

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

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
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={post.liked}
              likeCount={post.likeCount}
              onLikeToggle={() => toggleLike(post.id)}
            />
          ))}
          
          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <p className="text-muted-foreground">Loading more posts...</p>
            </div>
          )}
          
          {/* No more posts indicator */}
          {!hasMore && posts.length > 0 && (
            <div className="flex justify-center py-4">
              <p className="text-muted-foreground">No more posts to load.</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">Chưa có bài viết nào.</p>
      )}
    </main>
  )
}