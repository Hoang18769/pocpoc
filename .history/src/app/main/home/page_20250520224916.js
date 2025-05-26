// app/page.js hoặc pages/index.js
"use client"

import PostCard from "@/components/social-app-component/Postcard"
import avt from "@/assests/photo/AfroAvatar.png"

const mockData = {
  user: {
    name: "Nguyen Van A",
    avatar: {avt}
  },
  timestamp: "2 hours ago",
  content: "This is a demo post with a lovely image.",
  image: "https://source.unsplash.com/random/800x800?sig=1",
  likes: 1200,
  comments: [
    {
      user: {
        name: "Tran B",
        avatar: "https://i.pravatar.cc/150?img=45"
      },
      content: "Wow! This looks amazing.",
      timestamp: "1 hour ago",
      likes: 10
    },
    {
      user: {
        name: "Le C",
        avatar: "https://i.pravatar.cc/150?img=36"
      },
      content: "I totally agree!",
      timestamp: "45 minutes ago",
      likes: 5
    }
  ]
}

export default function HomePage() {
  return (
    <main className="p-6 space-y-6">
      <PostCard {...mockData} />
    </main>
  )
}
