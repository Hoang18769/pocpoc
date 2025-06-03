'use client'

import { useState } from 'react'
import PostCard from '@/components/social-app-component/Postcard'

const savedPosts = [
  {
    id: 101,
    user: { name: 'Lily', avatar: '/avatar/lily.jpg' },
    time: '4 hours ago',
    content: 'Throwback to my Bali trip 🌴',
    images: [
      'https://picsum.photos/seed/a/500',
      'https://picsum.photos/seed/b/400',
      'https://picsum.photos/seed/c/300',
    ],
    likes: 45,
    latestComment: { user: 'mike', content: 'Awesome trip!' },
    totalComments: 7,
  },
  {
    id: 102,
    user: { name: 'Alex', avatar: '/avatar/alex.jpg' },
    time: '1 day ago',
    content: 'My art collection 🎨',
    images: ['https://picsum.photos/seed/d/600'],
    likes: 78,
    latestComment: { user: 'sarah', content: 'Love your style!' },
    totalComments: 15,
  },
]

export default function SavePostPage() {
  const [likedPosts, setLikedPosts] = useState({})

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  return (
    <main className="p-6 space-y-6 flex flex-col items-center">
      <h1 className="text-2xl font-semibold w-full max-w-xl mb-4">Bài viết đã lưu</h1>
      {savedPosts.map((post) => (
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
