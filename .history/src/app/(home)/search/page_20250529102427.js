"use client"

import React from "react"
import PostCard from "@/components/social-app-component/PostCard"
import Image from "next/image"

const postSample1 = {
  id: 1,
  content: "Đây là bài viết mẫu 1",
  images: [
    "https://source.unsplash.com/random/800x600?sig=1",
    "https://source.unsplash.com/random/800x600?sig=2",
  ],
  user: {
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
}

const postSample2 = {
  id: 2,
  content: "Khám phá ảnh mới!",
  images: ["https://source.unsplash.com/random/800x600?sig=3"],
  user: {
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
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
        <PostCard key="post2" post={postSample2} />
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
