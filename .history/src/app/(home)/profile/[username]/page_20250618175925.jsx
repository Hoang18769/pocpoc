"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import api from "@/utils/axios"
import PostCard from "@/components/social-app-component/PostCard"
import usePostActions from "@/hooks/usePostAction"

export default function ProfilePage() {
  const { username: routeUsername } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [posts, setPosts] = useState([])
  const [files, setFiles] = useState([])
  const [localUsername, setLocalUsername] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState("posts") // Đổi mặc định từ "post" thành "posts"
  const { toggleLike } = usePostActions({ posts, setPosts })

  useEffect(() => {
    const storedUsername = localStorage.getItem("userName")
    if (storedUsername) {
      setLocalUsername(storedUsername)
      setIsOwnProfile(storedUsername === routeUsername)
    }
  }, [routeUsername])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!routeUsername) return
      try {
        const res = await api.get(`/v1/users/${routeUsername}`)
        if (res.data.code === 200) {
          setProfileData(res.data.body)
        }
        console.log(res.data.body)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }

    fetchProfile()
  }, [routeUsername])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!routeUsername) return
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.warn("Không có token đăng nhập")
        return
      }

      try {
        const res = await api.get(`/v1/posts/of-user/${routeUsername}`)
        if (res.data.code === 200) {
          setPosts(res.data.body || [])
        }
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error)
      }
    }

    fetchPosts()
  }, [routeUsername])

  // Thêm useEffect để fetch files khi tab = "file" 
  useEffect(() => {
    const fetchFiles = async () => {
      if (!routeUsername || activeTab !== "file") return
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.warn("Không có token đăng nhập")
        return
      }

      try {
        const res = await api.get(`/v1/posts/files/${}`)
        if (res.data.code === 200) {
          setFiles(res.data.body || [])
        }
      } catch (error) {
        console.error("Lỗi khi tải files:", error)
      }
    }

    fetchFiles()
  }, [routeUsername, activeTab])

  // Hàm xử lý khi tab thay đổi từ ProfileHeader
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleToggleLike = async (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post

        const liked = post.liked
        const updatedPost = {
          ...post, // tạo object mới
          liked: !liked,
          likeCount: post.likeCount + (liked ? -1 : 1),
        }

        // Gọi API bất đồng bộ
        ;(async () => {
          try {
            if (liked) {
              await api.delete(`/v1/posts/unlike/${postId}`)
            } else {
              await api.post(`/v1/posts/like/${postId}`)
            }
          } catch (err) {
            console.error("Toggle like failed:", err)
          }
        })()

        return updatedPost
      })
    )
  }

  return (
    <main className="max-w-4xl mx-auto mt-4">
      {profileData ? (
        <>
          <ProfileHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onProfileUpdate={(updatedData) =>
              setProfileData((prev) => ({ ...prev, ...updatedData }))
            }
          />

          {/* Content based on active tab - Loại bỏ Tab Navigation vì đã có trong ProfileHeader */}
          <section className="mt-6 space-y-4">
            {activeTab === "posts" ? (
              // Hiển thị posts
              posts.length > 0 ? (
                posts
                  .slice() // tạo bản sao để không ảnh hưởng mảng gốc
                  .reverse() // đảo ngược thứ tự
                  .map((post, index) => (
                    <PostCard
                      key={post.id || Math.random().toString(36)}
                      post={post}
                      liked={post.liked}
                      likeCount={post.likeCount}
                      onLikeToggle={() => toggleLike(post.id)}
                    />
                  ))
              ) : (
                <p className="text-gray-500">Chưa có bài viết nào.</p>
              )
            ) : (
              // Hiển thị files
              files.length > 0 ? (
                files
                  .slice()
                  .reverse()
                  .map((file, index) => (
                    <PostCard
                      key={file.id || Math.random().toString(36)}
                      post={file}
                      liked={file.liked}
                      likeCount={file.likeCount}
                      onLikeToggle={() => toggleLike(file.id)}
                    />
                  ))
              ) : (
                <p className="text-gray-500">Chưa có file nào.</p>
              )
            )}
          </section>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </main>
  )
}