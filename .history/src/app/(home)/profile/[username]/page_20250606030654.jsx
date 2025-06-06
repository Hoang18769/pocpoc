"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import api from "@/utils/axios"
import Connectimg from "@/assests/photo/Connect.jpg"

export default function ProfilePage() {
  const { username: routeUsername } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [posts, setPosts] = useState([])
  const [localUsername, setLocalUsername] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

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
        const res = await api.get(`/v1/users/${routeUsername}`, {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000,
        })
        if (res.data.code === 200) {
          setProfileData(res.data.body)
        }
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
        const res = await api.get(`/v1/posts/of-user/${routeUsername}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        console.log(res)
        if (res.data.code === 200) {
          setPosts(res.data.body || [])
        }
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error)
      }
    }

    fetchPosts()
  }, [routeUsername])

  return (
    <main className="max-w-4xl mx-auto mt-4">
      {profileData ? (
        <>
          <ProfileHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            onProfileUpdate={(updatedData) =>
              setProfileData((prev) => ({ ...prev, ...updatedData }))
            }
          />

          {/* Hiển thị danh sách bài viết */}
          <section className="mt-6 space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="p-4 border rounded-md shadow">
                  <p className="font-semibold">{post.content}</p>
                  <p className="text-sm text-gray-500">Privacy: {post.privacy}</p>
                  <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có bài viết nào.</p>
            )}
          </section>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </main>
  )
}
