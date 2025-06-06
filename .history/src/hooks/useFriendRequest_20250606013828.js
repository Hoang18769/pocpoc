import { useEffect, useState } from "react";
import api from "@/utils/axios";

export default function useFriendRequestStatus(username, options = {}) {
  const [status, setStatus] = useState("idle"); // 'sent' | 'received' | 'none' | 'friend'
  const { onReceivedRequestId, disabled = false } = options;

  useEffect(() => {
    if (!username || disabled) return;

    const fetchStatus = async () => {
      try {
        const [sentRes, receivedRes, friendsRes] = await Promise.all([
          api.get("/v1/friend-request/sent-requests"),
          api.get("/v1/friend-request/received-requests"),
          api.get("/v1/friends"), // ⬅️ sử dụng từ controller bạn đã cung cấp
        ]);

        const sent = sentRes.data.body;
        const received = receivedRes.data.body;
        const friends = friendsRes.data.body;

        // ✅ Đã là bạn
        const isFriend = friends.some(friend => friend.username === username);
        if (isFriend) {
          setStatus("friend");
          return;
        }

        // ✅ Đã gửi lời mời
        const sentReq = sent.find(r => r.user.username === username);
        if (sentReq) {
          setStatus("sent");
          return;
        }

        // ✅ Đã nhận lời mời
        const receivedReq = received.find(r => r.user.username === username);
        if (receivedReq) {
          setStatus("received");
          onReceivedRequestId?.(receivedReq.requestId);
          return;
        }

        // ❌ Không có mối quan hệ
        setStatus("none");
      } catch (err) {
        console.error("❌ Lỗi khi kiểm tra trạng thái kết bạn:", err);
        setStatus("none");
      }
    };

    fetchStatus();
  }, [username, disabled, onReceivedRequestId]);

  return [status, setStatus];
}
