import { useEffect, useState } from "react";
import api from "@/utils/axios";

export default function useFriendRequestStatus(viewedUsername) {
  const [status, setStatus] = useState("idle"); // 'sent' | 'received' | 'none' | 'idle'

  useEffect(() => {
    if (!viewedUsername) {
      console.warn("❗ viewedUsername is not defined");
      return;
    }

    const fetchStatus = async () => {
      console.log("📡 Fetching friend request status for:", viewedUsername);
      try {
        const [sentRes, receivedRes] = await Promise.all([
          api.get("/v1/friend-request/sent-requests"),
          api.get("/v1/friend-request/received-requests"),
        ]);

        const sent = sentRes;
        const received = receivedRes;

        console.log("📤 Sent Requests:", sent);
        console.log("📥 Received Requests:", received);

        const sentMatch = sent.find(
          (r) => r.receiver?.username === viewedUsername
        );
        const receivedMatch = received.find(
          (r) => r.sender?.username === viewedUsername
        );

        if (sentMatch) {
          console.log("✅ Found matching sent request:", sentMatch);
          setStatus("sent");
        } else if (receivedMatch) {
          console.log("✅ Found matching received request:", receivedMatch);
          setStatus("received");
        } else {
          console.log("ℹ️ No matching requests found.");
          setStatus("none");
        }
      } catch (err) {
        console.error("❌ Lỗi khi kiểm tra trạng thái kết bạn:", err);
        setStatus("none");
      }
    };

    fetchStatus();
  }, [viewedUsername]);

  return status; // 'sent' | 'received' | 'none' | 'idle'
}
