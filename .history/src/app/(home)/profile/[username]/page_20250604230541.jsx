"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import PostCard from "@/components/social-app-component/Postcard"
import api from "@/utils/axios"

export default function ProfilePage() {
  const { username: paramUsername } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const currentUsername = localStorage.getItem("username")
    if (!paramUsername) return
    setIsOwner(currentUsername === paramUsername)

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/v1/users/${paramUsername}`, {
          headers: { "Content-Type": "application/json" },
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
  }, [paramUsername])

  return (
    <main className="max-w-4xl mx-auto mt-4">
      {profileData ? (
        <>
          <ProfileHeader
            profileData={profileData}
            isOwner={isOwner}
            onProfileUpdate={(updatedData) =>
              setProfileData((prev) => ({ ...prev, ...updatedData }))
            }
          />
          {/* Ví dụ hiển thị bài viết */}
          {/* {profileData.posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))} */}
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </main>
  )
}
