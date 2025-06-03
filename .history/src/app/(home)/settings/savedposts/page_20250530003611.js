// src/app/(home)/savepost/page.jsx
'use client'
import React from 'react'
import Postcard from '@/components/social-app-component/Postcard'

const savedPosts = [
  {
    id: 'post1',
    user: { name: 'John Doe', avatar: '/avatar1.png' },
    content: 'This is a saved post!',
    images: ['/assests/photo/Connect.jpg'],
    liked: true,
    likesCount: 10,
    commentsCount: 3,
  },
  {
    id: 'post2',
    user: { name: 'Jane Smith', avatar: '/avatar2.png' },
    content: 'Another saved post.',
    images: ['/assests/photo/connectimg.png'],
    liked: false,
    likesCount: 25,
    commentsCount: 5,
  },
]

export default function SavePostPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Bài viết đã lưu</h1>
      {savedPosts.map((post) => (
        <Postcard
          key={post.id}
          id={post.id}
          user={post.user}
          content={post.content}
          images={post.images}
          liked={post.liked}
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
        />
      ))}
    </div>
  )
}
