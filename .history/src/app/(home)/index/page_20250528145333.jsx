// app/page.js hoặc pages/index.js
"use client"

import PostCard from "@/components/social-app-component/PostCard"
import avt from "@/assests/photo/AfroAvatar.png"

const postSample = {
  user: {
    name: "Jane Doe",
    // avatar: "/avatars/jane.png", // hoặc để trống sẽ dùng ảnh `avt` mặc định
  },
  time: "2 hours ago",
  content: "Exploring the mountains today! 🏔️ The view is breathtaking and I feel so alive.",
  // image: "/images/mountains.jpg", // bạn có thể thay bằng URL thực tế
  likes: 132,
  latestComment: {
    user: "johnsmith",
    content: "Wow! Looks amazing 😍",
  },
  totalComments: 24,
}
const postSample1 = {
  user: {
    name: "Jane Doe",
    // avatar: "/avatars/jane.png", // hoặc để trống sẽ dùng ảnh `avt` mặc định
  },
  time: "2 hours ago",
  content: "Exploring the mountains today! 🏔️ The view is breathtaking and I feel so alive.",
  // image: "/images/mountains.jpg", // bạn có thể thay bằng URL thực tế
  likes: 132,
  latestComment: {
    user: "johnsmith",
    content: "Wow! Looks amazing 😍",
  },
  totalComments: 24,
}


export default function HomePage() {
  return (
      <main className="p-6 space-y-6 flex flex-col items-center">
       <PostCard post={postSample} />
      <PostCard post={postSample} />
      <PostCard post={postSample1} />
    </main>
  )
}
