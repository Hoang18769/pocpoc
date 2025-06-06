import useFriendRequestStatus from "@/hooks/useFriendRequestStatus";

export default function ProfileHeader({ profileData, isOwnProfile = true, onProfileUpdate }) {
  const requestStatus = useFriendRequestStatus(profileData.username);

  const sendFriendRequest = async () => {
    try {
      const res = await api.post(`/v1/friend-request/${profileData.username}`);
      if (res.data.code === 200) {
        window.location.reload(); // hoặc refetch requestStatus bằng refetch trigger
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const acceptFriendRequest = async () => {
    try {
      const requestId = // lấy requestId từ receivedRequests nếu cần
      await api.post(`/v1/friend-request/accept/${requestId}`);
      window.location.reload();
    } catch (err) {
      console.error("Error accepting friend request", err);
    }
  };

  const renderFriendButton = () => {
    if (requestStatus === "sent") {
      return <button disabled className="px-4 py-1 bg-gray-300 text-gray-600 rounded">Đã gửi lời mời</button>;
    } else if (requestStatus === "received") {
      return <button onClick={acceptFriendRequest} className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded">Đồng ý</button>;
    } else {
      return <button onClick={sendFriendRequest} className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">Kết bạn</button>;
    }
  };
