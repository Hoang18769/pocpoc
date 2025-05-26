import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import PostCard from "@/components/social-app-component/Postcard"
const postSample = {
  user: {
    name: "Jane Doe",
    avatar: "/avatars/jane.png", // hoặc để trống sẽ dùng ảnh `avt` mặc định
  },
  time: "2 hours ago",
  content: "Exploring the mountains today! 🏔️ The view is breathtaking and I feel so alive.",
  image: "/images/mountains.jpg", // bạn có thể thay bằng URL thực tế
  likes: 132,
  latestComment: {
    user: "johnsmith",
    content: "Wow! Looks amazing 😍",
  },
  totalComments: 24,
}
export default function ProfilePage() {
  return (
    <main className="border max-w-4xl mx-auto mt-4">
      <ProfileHeader />
      <PostCard post={postSample} />
            <PostCard post={postSample} />
            <PostCard post={postSample} />
    </main>
  )
}
