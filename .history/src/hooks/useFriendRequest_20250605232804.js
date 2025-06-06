import { useEffect, useState } from "react";
import axios from "axios";

export default function useFriendRequestStatus(viewedUsername) {
  const [status, setStatus] = useState("idle"); // 'sent' | 'received' | 'none'

  useEffect(() => {
    if (!viewedUsername) return;

    const fetchStatus = async () => {
      try {
        const [sentRes, receivedRes] = await Promise.all([
          axios.get("/v1/friend-request/sent-requests"),
          axios.get("/v1/friend-request/received-requests"),
        ]);

        const sent = sentRes.data.data.content;
        const received = receivedRes.data.data.content;

        if (sent.some((r) => r.receiver.username === viewedUsername)) {
          setStatus("sent");
        } else if (received.some((r) => r.sender.username === viewedUsername)) {
          setStatus("received");
        } else {
          setStatus("none");
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái kết bạn:", err);
      }
    };

    fetchStatus();
  }, [viewedUsername]);

  return status; // => 'sent' | 'received' | 'none'
}
