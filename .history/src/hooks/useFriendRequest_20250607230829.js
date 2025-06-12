import { useEffect, useState } from "react";
import api from "@/utils/axios";

// Trạng thái: 'idle' | 'sent' | 'received' | 'friend' | 'none'
export default function useFriendRequestStatus(username, options = {}) {
  const [status, setStatus] = useState("idle");
  const [friendId, setFriendId] = useState(null);
  const { onReceivedRequestId, disabled = false } = options;

  useEffect(() => {
    if (!username || disabled) return;

    const fetchStatus = async () => {
      try {
        const [sentRes, receivedRes, friendsRes] = await Promise.all([
          api.get("/v1/friend-request/sent-requests"),
          api.get("/v1/friend-request/received-requests"),
          api.get("/v1/friends"),
        ]);

        const sent = sentRes.data.body;
        const received = receivedRes.data.body;
        const friends = friendsRes.data.body;
        console.log(sentRes)
        console.log(received)

        const isSent = sent.find((r) => r.user.username === username);
        if (isSent) {
          setStatus("sent");
          setFriendId(isSent.requestId);
          return;
        }

        const isReceived = received.find((r) => r.user.username === username);
        if (isReceived) {
          setStatus("received");
          setFriendId(null);
          onReceivedRequestId?.(isReceived.requestId);
          return;
        }

        const isFriend = friends.find((f) => f.user.username === username);
        if (isFriend) {
          setStatus("friend");
          setFriendId(isFriend.friendId); // Chứa friendId để gọi API hủy kết bạn
          return;
        }

        setStatus("none");
        setFriendId(null);
      } catch (err) {
        console.error("❌ Lỗi khi kiểm tra trạng thái kết bạn:", err);
        setStatus("none");
        setFriendId(null);
      }
    };

    fetchStatus();
  }, [username, disabled, onReceivedRequestId]);

  return [status, setStatus, friendId];
}
