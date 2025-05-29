"use client"

import { useState } from "react"
import PostCard from "@/components/social-app-component/Postcard"
import avt from "@/assests/photo/AfroAvatar.png"

const postsData = [
  {
    id: 1,
    user: { name: "Jane", avatar: "/avatar/jane.jpg" },
    time: "3 hours ago",
    content: "Check out my trip!",
    images: [
      "https://picsum.photos/500",
      "https://picsum.photos/400/300",
      "https://picsum.photos/300",
      "https://picsum.photos/600",
      "https://picsum.photos/500/300"
    ],
    likes: 99,
    latestComment: { user: "bob", content: "So cool!" },
    totalComments: 12,
  },
  {
    id: 2,
    user: { name: "Jane Doe" },
    time: "2 hours ago",
    content: "Exploring the mountains today!",
    likes: 132,
    latestComment: { user: "johnsmith", content: "Wow! Looks amazing 😍" },
    totalComments: 24,
  },
  {
    id: 3,
    user: { name: "Jane Doe" },
    time: "1 hour ago",
    content: "Sunset over the ocean 🌅",
    likes: 87,
    latestComment: { user: "alice", content: "Beautiful view!" },
    totalComments: 10,
  },
]

export default function HomePage() {
  const [likedPosts, setLikedPosts] = useState({})

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  return (
    <main className="p-6 space-y-6 flex flex-col items-center">
      {postsData.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          liked={!!likedPosts[post.id]}
          onLikeToggle={() => toggleLike(post.id)}
        />
      ))}
    </main>
  )
}
