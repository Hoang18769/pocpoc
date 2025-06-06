"use client"

import { useEffect, useState } from "react"
import Avatar from "../ui-components/Avatar"
import Modal from "../ui-components/Modal"
import EditProfileModal from "./EditProfile"
import api from "@/utils/axios"

export default function ProfileHeader({ profileData, isOwnProfile = true, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState("posts")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [friendRequestStatus, setFriendRequestStatus] = useState("loading") // 'none', 'sent', 'received'
  const [requestId, setRequestId] = useState(null)

  const avatar = profileData.profilePictureUrl

  useEffect(() => {
    if (isOwnProfile || !profileData?.username) return

    const fetchFriendRequestStatus = async () => {
      try {
        const [sent, received] = await Promise.all([
          api.get("/v1/friend-request/sent-requests"),
          api.get("/v1/friend-request/received-requests"),
        ])

        const sentReq = sent.data.data.content.find(
          (r) => r.receiver.username === profileData.username
        )
        if (sentReq) {
          setFriendRequestStatus("sent")
          return
        }

        const receivedReq = received.data.data.content.find(
          (r) => r.sender.username === profileData.username
        )
        if (receivedReq) {
          setFriendRequestStatus("received")
          setRequestId(receivedReq.id) // để sử dụng khi accept
          return
        }

        setFriendRequestStatus("none")
      } catch (err) {
        console.error("Lỗi khi lấy trạng thái bạn bè:", err)
        setFriendRequestStatus("none")
      }
    }

    fetchFriendRequestStatus()
  }, [profileData, isOwnProfile])

  const handleSaveProfile = (newData) => {
    if (onProfileUpdate) onProfileUpdate(newData)
    setIsEditModalOpen(false)
  }

  const sendFriendRequest = async () => {
    try {
      const res = await api.post(`/v1/friend-request/${profileData.username}`)
      if (res.data.code === 200) {
        setFriendRequestStatus("sent")
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  const acceptFriendRequest = async () => {
    if (!requestId) return
    try {
      const res = await api.post(`/v1/friend-request/accept/${requestId}`)
      if (res.data.code === 200) {
        setFriendRequestStatus("friends")
      }
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const renderFriendButton = () => {
    if (friendRequestStatus === "sent") {
      return (
        <button
          disabled
          className="px-4 py-1 bg-gray-300 text-gray-600 rounded text-sm cursor-not-allowed"
        >
          Đã gửi lời mời
        </button>
      )
    }

    if (friendRequestStatus === "received") {
      return (
        <button
          onClick={acceptFriendRequest}
          className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
        >
          Đồng ý
        </button>
      )
    }

    if (friendRequestStatus === "none") {
      return (
        <button
          onClick={sendFriendRequest}
          className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          Kết bạn
        </button>
      )
    }

    return null
  }

  return (
    <div className="w-full">
      {/* Info Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6">
        <Avatar
          src={avatar}
          alt="Avatar"
          className="rounded-full object-cover md:w-28 md:h-28 sm:w-32 sm:h-32"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">
              {profileData?.givenName || ""} {profileData?.familyName || ""}
            </h2>
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1 border rounded-full text-sm text-gray-600 hover:bg-gray-100"
              >
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              renderFriendButton()
            )}
          </div>

          <p className="text-gray-500 text-sm">@{profileData?.username}</p>

          <div className="flex gap-4 mt-1 text-sm">
            <span><strong>0</strong> Bài viết</span>
            <span><strong>{profileData?.friendCount || 0}</strong> Bạn bè</span>
          </div>

          <p className="text-sm mt-2 text-gray-700">{profileData?.bio || "Chưa có mô tả cá nhân."}</p>
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
          🧱 Bài viết
        </button>
        <button
          className={`flex items-center gap-1 ${
            activeTab === "photos"
              ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={() => setActiveTab("photos")}
        >
          🖼 Ảnh
        </button>
        <button
          className="flex items-center gap-1 text-gray-400 cursor-not-allowed"
          disabled
        >
          💾 Đã lưu
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <EditProfileModal profileData={profileData} onSave={handleSaveProfile} />
      </Modal>
    </div>
  )
}
