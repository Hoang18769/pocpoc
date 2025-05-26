import Image from "next/image"
import Avatar from "../ui-components/Avatar"
import Card from "../ui-components/Card"

export default function PostCard({ post }) {
  return (
    <Card className="flex flex-col md:flex-row gap-4 p-4">
      {/* LEFT SIDE: Thông tin bài viết */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar src={post.user.avatar} alt={post.user.name} size={40} />
            <div>
              <p className="text-sm font-semibold">{post.user.name}</p>
              <p className="text-xs text-gray-500">{post.time}</p>
            </div>
          </div>
          <button className="text-gray-400 text-xl">•••</button>
        </div>

        {/* Nội dung bài viết */}
        <p className="text-sm mb-2">{post.content}</p>

        {/* Hành động */}
        <div className="flex gap-4 text-gray-500 text-sm mb-2">
          <button>❤️</button>
          <button>💬</button>
          <button>📤</button>
        </div>

        {/* Lượt thích */}
        <p className="text-xs text-gray-500 mb-2">{post.likes} likes</p>

        {/* Comment mới nhất */}
        <div className="text-sm">
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>

        {/* Xem thêm */}
        <button className="text-xs text-gray-400 mt-2 hover:underline">
          View all {post.totalComments} comments
        </button>
      </div>

      {/* RIGHT SIDE: Hình ảnh */}
      <div className="w-full md:w-[300px] rounded-lg overflow-hidden">
        <Image
          src={post.image}
          alt="Post image"
          width={300}
          height={300}
          className="object-cover w-full h-auto"
        />
      </div>
    </Card>
  )
}
