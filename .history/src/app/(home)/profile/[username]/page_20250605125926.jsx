"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import api from "@/utils/axios"

export default function ProfilePage() {
  const { userName: routeUsername } = useParams() // lấy từ URL
  const [profileData, setProfileData] = useState(null)
  const [localUsername, setLocalUsername] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
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
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </main>
  )
}
