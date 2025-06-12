"use client";

import { useState } from "react";
import Avatar from "../ui-components/Avatar";
import Modal from "../ui-components/Modal";
import EditProfileModal from "./EditProfile";
import useFriendRequestStatus from "@/hooks/useFriendRequest";
import api from "@/utils/axios";
import toast from "react-hot-toast";

export default function ProfileHeader({ profileData, isOwnProfile = true, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const avatar = profileData.profilePictureUrl;

  const [
    friendRequestStatus,
    setFriendRequestStatus,
    requestId,
    friendId
  ] = useFriendRequestStatus(profileData?.username, {
    disabled: isOwnProfile,
  });

  const handleSaveProfile = (newData) => {
    if (onProfileUpdate) onProfileUpdate(newData);
    setIsEditModalOpen(false);
  };

  const cancelFriendRequest = async () => {
    const prevStatus = friendRequestStatus;
    setFriendRequestStatus("none"); // optimistic
    try {
      await api.delete(`/v1/friend-request/delete/${requestId}`);
      toast.success("Đã hủy lời mời kết bạn");
    } catch (error) {
      setFriendRequestStatus(prevStatus);
      toast.error("Lỗi khi hủy lời mời");
    }
  };

  const declineFriendRequest = async () => {
    const prevStatus = friendRequestStatus;
    setFriendRequestStatus("none"); // optimistic
    try {
      await api.delete(`/v1/friend-request/delete/${requestId}`);
      toast.success("Đã từ chối lời mời");
    } catch (error) {
      setFriendRequestStatus(prevStatus);
      toast.error("Lỗi khi từ chối lời mời");
    }
  };

  const sendFriendRequest = async () => {
    const prevStatus = friendRequestStatus;
    setFriendRequestStatus("sent"); // optimistic
    try {
      const res = await api.post(`/v1/friend-request/${profileData.username}`);
      if (res.data.code !== 200) throw new Error();
      toast.success("Đã gửi lời mời kết bạn");
    } catch (error) {
      setFriendRequestStatus(prevStatus);
      toast.error("Lỗi khi gửi lời mời");
    }
  };

  const acceptFriendRequest = async () => {
    const prevStatus = friendRequestStatus;
    setFriendRequestStatus("friend"); // optimistic
    try {
      const res = await api.post(`/v1/friend-request/accept/${requestId}`);
      if (res.data.code !== 200) throw new Error();
      toast.success("Đã chấp nhận kết bạn");
    } catch (error) {
      setFriendRequestStatus(prevStatus);
      toast.error("Lỗi khi chấp nhận kết bạn");
    }
  };

  const unfriend = async () => {
    const prevStatus = friendRequestStatus;
    setFriendRequestStatus("none"); // optimistic
    try {
      await api.delete(`/v1/friends/${friendId}`);
      toast.success("Đã hủy kết bạn");
      console.log()
    } catch (error) {
      setFriendRequestStatus(prevStatus);
      toast.error("Lỗi khi hủy kết bạn");
    }
  };

  const renderFriendButton = () => {
    switch (friendRequestStatus) {
      case "sent":
        return (
          <button
            onClick={cancelFriendRequest}
            className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Hủy lời mời
          </button>
        );
      case "received":
        return (
          <div className="flex gap-2">
            <button
              onClick={acceptFriendRequest}
              className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
            >
              Đồng ý
            </button>
            <button
              onClick={declineFriendRequest}
              className="px-4 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
            >
              Từ chối
            </button>
          </div>
        );
      case "friend":
        return (
          <button
            onClick={unfriend}
            className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Hủy kết bạn
          </button>
        );
      case "none":
        return (
          <button
            onClick={sendFriendRequest}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            Kết bạn
          </button>
        );
      default:
        return null;
    }
  };

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
            <span>
              <strong>0</strong> Bài viết
            </span>
            <span>
              <strong>{profileData?.friendCount || 0}</strong> Bạn bè
            </span>
          </div>

          <p className="text-sm mt-2 text-gray-700">
            {profileData?.bio || "Chưa có mô tả cá nhân."}
          </p>
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
        <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed" disabled>
          💾 Đã lưu
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <EditProfileModal profileData={profileData} onSave={handleSaveProfile} />
      </Modal>
    </div>
  );
}
