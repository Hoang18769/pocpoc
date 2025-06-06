"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import api from "@/utils/axios"
import Connectimg from "@/assests/photo/Connect.jpg"
import PostCard from "@/components/social-app-component/PostCard"

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
        const res = await api.get(`/v1/users/${routeUsername}`)
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

  const handleToggleLike = async (postId) => {
    const updatedPosts = [...posts]
    const postIndex = updatedPosts.findIndex((p) => p.id === postId)
    if (postIndex === -1) return

    const post = updatedPosts[postIndex]
    const currentlyLiked = post.liked

    try {
      if (currentlyLiked) {
        await api.delete(`/v1/posts/unlike/${postId}`)
      } else {
        await api.post(`/v1/posts/like/${postId}`)
      }

      // Cập nhật lại likeCount và liked
      updatedPosts[postIndex] = {
        ...post,
        liked: !currentlyLiked,
        likeCount: post.likeCount + (currentlyLiked ? -1 : 1)
      }

      setPosts(updatedPosts)
    } catch (error) {
      console.error("Lỗi khi toggle like:", error)
    }
  }

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

          <section className="mt-6 space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikeToggle={() => handleToggleLike(post.id)}
                />
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
