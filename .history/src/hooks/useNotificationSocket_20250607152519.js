"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";

export default function useNotificationSocket(userId, token) {
  const clientRef = useRef(null);
  useEffect(() => {
    if (!userId || !token) return;

    const client = createStompClient(token);
    clientRef.current = client;

    client.onConnect = () => {
      console.log("🔌 Connected to WebSocket");

      client.subscribe(`/notifications/${userId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("🔔 Notification received:", data);

          // ✅ Xử lý và hiển thị toast tùy theo action
          switch (data.action) {
            case "SENT_ADD_FRIEND_REQUEST":
              toast(`${data.creator.givenName} đã gửi lời mời kết bạn 💌`);
              break;

            case "ACCEPTED_FRIEND_REQUEST":
              toast(`${data.creator.givenName} đã chấp nhận lời mời kết bạn 🤝`);
              break;
            case "NEW_MESSAGE":
            toast(`${data.creator.givenName} đã nhắn tin cho bạn 💬`);
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
      console.error("❌ STOMP error", frame);
    };

    client.activate();

    return () => {
      client.deactivate();
      console.log("❌ Disconnected from WebSocket");
    };
  }, [userId, token]);
}
