"use client";

import { useState } from "react";
import Avatar from "../ui-components/Avatar";
import Modal from "../ui-components/Modal";
import EditProfileModal from "./EditProfile";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import useAppStore from "@/store/ZustandStore";

export default function ProfileHeader({ 
  profileData, 
  isOwnProfile = true, 
  activeTab = "posts", // Nhận activeTab từ parent
  onTabChange, // Nhận callback để thay đổi tab
  onProfileUpdate 
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const avatar = profileData.profilePictureUrl;
  const { username: routeUsername } = useParams();
  const router = useRouter();

  const username = profileData.username;
  const navigateToChat = useAppStore((state) => state.navigateToChat);
  const selectChat = useAppStore((state) => state.selectChat);
  const showVirtualChat = useAppStore((state) => state.showVirtualChat);
  const chatList = useAppStore((state) => state.chatList);

  const handleBlockUser = async () => {
    const confirm = window.confirm(`Bạn có chắc muốn chặn ${routeUsername}?`);
    if (!confirm) return;

    try {
      const res = await api.post(`/v1/blocks/${routeUsername}`);
      if (res.data.code === 200) {
        alert(`Đã chặn ${routeUsername}`);
      } else {
        console.warn("Chặn thất bại:", res.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi chặn người dùng:", error);
      alert("Có lỗi xảy ra khi chặn người dùng.");
    }
  };

  const handleSaveProfile = (newData) => {
    if (onProfileUpdate) onProfileUpdate(newData);
    setIsEditModalOpen(false);
  };

const handleChatClick = () => {
  const targetUserId = profileData.id;
  const targetUsername = profileData.username;

  console.log("🔍 handleChatClick:", { targetUserId, targetUsername });

  if (!targetUserId) {
    toast.error("Không thể tìm thấy thông tin người dùng");
    return;
  }

  // ✅ Tìm chat theo cả userId và username (khớp với cấu trúc store)
  const existingChat = chatList.find(chat => {
    return chat.target?.id === targetUserId || 
           chat.target?.username === targetUsername;
  });

  console.log("🎯 Existing chat found:", existingChat);

  if (existingChat) {
    // ✅ Sử dụng đúng field name từ store
    const chatId = existingChat.chatId;
    console.log("✅ Selecting existing chat:", chatId);
    
    selectChat(chatId); // ✅ Chỉ truyền chatId, không cần target
    
    router.push('/chats');
    return;
  }

  // ✅ Tạo virtual chat với đúng structure
  const virtualChatData = {
    username: profileData.username,
    givenName: profileData.givenName,
    familyName: profileData.familyName,
    profilePictureUrl: profileData.profilePictureUrl,
    online: profileData.online || false
  };

  console.log("🆕 Creating virtual chat:", virtualChatData);
  showVirtualChat(targetUserId, virtualChatData);
  
  router.push('/chats');
};

  const cancelFriendRequest = async () => {
    try {
      await api.delete(`/v1/friend-request/delete/${username}`);
      toast.success("Đã hủy lời mời kết bạn");
      onProfileUpdate({ ...profileData, request: null });
    } catch (error) {
      toast.error("Lỗi khi hủy lời mời");
    }
  };

  const declineFriendRequest = async () => {
    try {
      await api.delete(`/v1/friend-request/delete/${username}`);
      toast.success("Đã từ chối lời mời");
      onProfileUpdate({ ...profileData, request: null });
    } catch (error) {
      toast.error("Lỗi khi từ chối lời mời");
    }
  };

  const sendFriendRequest = async () => {
    try {
      const res = await api.post(`/v1/friend-request/send/${username}`);
      if (res.data.code === 200) {
        toast.success("Gửi lời mời thành công");
        onProfileUpdate({ ...profileData, request: "OUT" });
      }
    } catch (error) {
      console.error("Lỗi gửi lời mời:", error);
    }
  };

  const acceptFriendRequest = async () => {
    try {
      const res = await api.post(`/v1/friend-request/accept/${username}`);
      if (res.data.code === 200) {
        toast.success("Đã chấp nhận kết bạn");
        onProfileUpdate({
          ...profileData,
          friend: true,
          request: null,
          friendCount: profileData.friendCount + 1
        });
      }
    } catch (error) {
      toast.error("Lỗi khi chấp nhận kết bạn");
    }
  };

  const unfriend = async () => {
    try {
      await api.delete(`/v1/friends/${username}`);
      toast.success("Đã hủy kết bạn");
      onProfileUpdate({
        ...profileData,
        isFriend: false,
        friendCount: profileData.friendCount - 1
      });
    } catch (error) {
      toast.error("Lỗi khi hủy kết bạn");
    }
  };
  const handleGetListFriend =()=>{}
  const renderFriendButton = () => {
    if (profileData.isFriend) {
      return (
        <button
          onClick={unfriend}
          className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
        >
          Hủy kết bạn
        </button>
      );
    }

    if (profileData.request) {
      if (profileData.request === "OUT") {
        return (
          <button
            onClick={cancelFriendRequest}
            className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Hủy lời mời
          </button>
        );
      } else if (profileData.request === "IN") {
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
      }
    }

    return (
      <button
        onClick={sendFriendRequest}
        className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
      >
        Kết bạn
      </button>
    );
  };

  // Hàm xử lý khi người dùng click vào tab
  const handleTabClick = (tabName) => {
    if (onTabChange) {
      onTabChange(tabName);
    }
  };

  return (
    <div className="w-full">
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
            <div className="flex gap-2">
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
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <button
                    onClick={handleChatClick}
                    className="px-4 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm"
                  >
                    Nhắn tin
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Chặn
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-500 text-sm">@{profileData?.username}</p>

          <div className="flex gap-4 mt-1 text-sm">
            <span>
              <strong>0</strong> Bài viết
            </span>
            <button onClick={handleGetListFriend}>
              <strong>{profileData?.friendCount || 0}</strong> Bạn bè
            </button>
          </div>

          <p className="text-sm mt-2 text-gray-700">
            {profileData?.bio || "Chưa có mô tả cá nhân."}
          </p>
        </div>
      </div>

      {/* Tab Navigation - Sử dụng activeTab từ props và gọi onTabChange */}
      <div className="flex justify-around text-sm border-t mt-4 pt-2">
        <button
          className={`flex items-center gap-1 ${
            activeTab === "posts"
              ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={() => handleTabClick("posts")}
        >
          🧱 Bài viết
        </button>
        <button
          className={`flex items-center gap-1 ${
            activeTab === "file"
              ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={() => handleTabClick("file")}
        >
          🖼 Ảnh và video
        </button>
        <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed" disabled>
          💾 Đã lưu
        </button>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <EditProfileModal profileData={profileData} onSave={handleSaveProfile} />
      </Modal>
    </div>
  );
}