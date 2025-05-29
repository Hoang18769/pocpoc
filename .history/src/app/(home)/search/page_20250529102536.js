"use client"

import React from "react"
import PostCard from "@/components/social-app-component/PostCard"
import Image from "next/image"

const post = {
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
}

const postSample1 = {
  user: {
    name: "Jane Doe",
    // avatar: "/avatars/jane.png", // hoặc để trống sẽ dùng ảnh `avt` mặc định
  },
  time: "2 hours ago",
  content: "Exploring the mountains today! 🏔️ The view is breathtaking and I feel so alive.",
  //image: "/images/mountains.jpg", // bạn có thể thay bằng URL thực tế
  likes: 132,
  latestComment: {
    user: "johnsmith",
    content: "Wow! Looks amazing 😍",
  },
  totalComments: 24,
}

const suggestedUsers = [
  {
    id: 1,
    name: "Lê Duy",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 2,
    name: "Phạm Hoa",
    avatar: "https://i.pravatar.cc/150?img=6",
  },
]

export default function ExplorerPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 py-6">
      {/* Phần bài viết (chiếm rộng) */}
      <div className="flex-1 space-y-6">
        <h1 className="text-xl font-bold">Khám phá</h1>
        <PostCard key="post1" post={postSample1} />
        <PostCard key="post2" post={post} />
      </div>

      {/* Phần gợi ý người dùng */}
      <div className="w-full lg:w-[300px] shrink-0">
        <div className="sticky top-20 space-y-4">
          <h2 className="text-lg font-semibold">Gợi ý cho bạn</h2>
          <ul className="space-y-3">
            {suggestedUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={200}
                    height={200}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button className="text-sm text-blue-500 hover:underline">
                  Theo dõi
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
