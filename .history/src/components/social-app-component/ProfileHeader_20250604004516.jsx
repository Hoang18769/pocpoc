"use client"

import { useState, useEffect } from "react"
import Avatar from "../ui-components/Avatar"
import Modal from "../ui-components/Modal"
import EditProfileModal from "./EditProfile"

export default function ProfileHeader({ profileData, isOwnProfile = true }) {
  const [activeTab, setActiveTab] = useState("posts")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [localProfileData, setProfileData] = useState(profileData)

  useEffect(() => {
    if (profileData) {
      setLocalProfileData(profileData)
    }
  }, [profileData])

  const handleSaveProfile = (newData) => {
    setLocalProfileData(newData)
    setIsEditModalOpen(false)
    console.log("Saving profile data:", newData)
    // Optional: Gọi API cập nhật profile ở đây
  }

  return (
    <div className="w-full">
      {/* Info Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6">
        <Avatar
          alt="Avatar"
          src={localProfileData?.profilePictureUrl || "/avatar-placeholder.png"}
          className="rounded-full object-cover md:w-28 md:h-28 sm:w-32 sm:h-32"
        />

        <div className="flex-1">
          {/* Name and Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">
              {localProfileData?.givenName || ""} {localProfileData?.familyName || ""}
            </h2>
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1 border rounded-full text-sm text-gray-600 hover:bg-gray-100"
              >
                Edit Profile
              </button>
            ) : (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Add Friend
              </button>
            )}
          </div>

          <p className="text-gray-500 text-sm">@{localProfileData?.username}</p>

          <div className="flex gap-4 mt-1 text-sm">
            <span><strong>0</strong> Posts</span> {/* Hiện chưa có số bài viết */}
            <span><strong>{localProfileData?.friendCount || 0}</strong> Friends</span>
          </div>

          <p className="text-sm mt-2 text-gray-700">{localProfileData?.bio || "No bio provided."}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around text-sm border-t mt-4 pt-2">
        <button
          className={`flex items-center gap-1 ${
            activeTab === "posts"
              ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={() => setActiveTab("posts")}
        >
          🧱 POSTS
        </button>
        <button
          className={`flex items-center gap-1 ${
            activeTab === "photos"
              ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={() => setActiveTab("photos")}
        >
          🖼 Photos
        </button>
        <button
          className="flex items-center gap-1 text-gray-400 cursor-not-allowed"
          disabled
        >
          💾 SAVED
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <EditProfileModal
          profileData={localProfileData}
          onSave={handleSaveProfile}
        />
      </Modal>
    </div>
  )
}
