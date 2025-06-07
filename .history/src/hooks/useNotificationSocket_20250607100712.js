"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";

export default function useNotificationSocket(userId) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("accessToken");
    const client = createStompClient(token); // lấy token mới nhất từ localStorage

    clientRef.current = client;

    client.onConnect = () => {
      console.log("🔌 Connected to WebSocket");

      client.subscribe(`/notifications/${userId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("🔔 Notification received:", data);

          switch (data.action) {
            case "SENT_ADD_FRIEND_REQUEST":
              toast(`${data.creator.givenName} đã gửi lời mời kết bạn 💌`);
              break;
            case "ACCEPTED_FRIEND_REQUEST":
              toast(`${data.creator.givenName} đã chấp nhận lời mời kết bạn 🤝`);
              break;
            case "POST_LIKED":
              toast(`${data.creator.givenName} đã thích bài viết của bạn ❤️`);
              break;
            case "NEW_MESSAGE":
              toast(`${data.creator.givenName} đã nhắn tin cho bạn 💬`);
              break;
            default:
              toast(`🔔 Có thông báo mới từ ${data.creator?.givenName || "ai đó"}`);
              break;
          }
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error(" STOMP error", frame);
    };

    set

    return () => {
      client.deactivate();
      console.log("Disconnected from WebSocket");
    };
  }, [userId]);
}
