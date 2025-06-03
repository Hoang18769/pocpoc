"use client"

import { useEffect, useState } from "react"
import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import PostCard from "@/components/social-app-component/Postcard"
import api from "@/utils/axios"
import axios from "axios"
export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null)
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${username}`, {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        })
        if (res.data.code === 200) {
          setProfileData(res.data.body)
          console.log(res.data.body)

        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }

    fetchProfile()
  }, [username])

  return (
    <main className="max-w-4xl mx-auto mt-4">
      {profileData ? (
        <>
          <ProfileHeader profileData={profileData} />
          {/* Ví dụ hiển thị bài viết người dùng */}
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
