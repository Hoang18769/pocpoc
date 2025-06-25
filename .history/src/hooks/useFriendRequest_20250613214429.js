import { useEffect, useState, useCallback } from "react";
import api from "@/utils/axios";

// Trạng thái: 'idle' | 'sent' | 'received' | 'friend' | 'none'
export default function useFriendRequestStatus(username, options = {}) {
  const [status, setStatus] = useState("idle");
  const [requestId, setRequestId] = useState(null);
  const [friendId, setFriendId] = useState(null);
  const { onReceivedRequestId, disabled = false } = options;
const userName = typeof window !== 'undefined' ? localStorage.getItem("userName") : null;
  const fetchStatus = useCallback(async () => {
    if (!username || disabled) return;

    try {
      const [sentRes, receivedRes, friendsRes] = await Promise.all([
        api.get("/v1/friend-request/sent-requests"),
        api.get("/v1/friend-request/received-requests"),
        api.get(`/v1/friends/${}`),
      ]);

      const sent = sentRes.data.body;
      const received = receivedRes.data.body;
      const friends = friendsRes.data.body;

      const isSent = sent.find((r) => r.user.username === username);
      if (isSent) {
        setStatus("sent");
        setRequestId(isSent.requestId);
        setFriendId(null);
        return;
      }

      const isReceived = received.find((r) => r.user.username === username);
      if (isReceived) {
        setStatus("received");
        setRequestId(isReceived.requestId);
        setFriendId(null);
        onReceivedRequestId?.(isReceived.requestId);
        return;
      }

      const isFriend = friends.find((f) => f.user.username === username);
      if (isFriend) {
        setStatus("friend");
        setFriendId(isFriend.friendId);
        setRequestId(null);
        return;
      }

      setStatus("none");
      setRequestId(null);
      setFriendId(null);
    } catch (err) {
      console.error("❌ Lỗi khi kiểm tra trạng thái kết bạn:", err);
      setStatus("none");
      setRequestId(null);
      setFriendId(null);
    }
  }, [username, disabled, onReceivedRequestId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return [status, setStatus, requestId, friendId, fetchStatus];
}
