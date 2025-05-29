// app/page.js hoặc pages/index.js
"use client"

import PostCard from "@/components/social-app-component/Postcard"
import avt from "@/assests/photo/AfroAvatar.png"

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


export default function HomePage() {
  return (
      <main className="p-6 space-y-6 flex flex-col items-center">
       <PostCard key={Math.random()} post={post} />
      <PostCard key={Math.random()} post={postSample1} />
    </main>
  )
}
