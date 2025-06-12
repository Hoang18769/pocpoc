// src/hooks/useNotificationSocket.js
"use client";

import { useEffect, useRef } from "react";
import { createStompClient}
import toast from "react-hot-toast";
import { getAuthToken, isTokenValid } from "@/lib/axios";

export default function useNotificationSocket(userId) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    let client = createStompClient();
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
            case "BE_FRIEND":
              toast(`${data.creator.givenName} đã trở thành bạn bè`);
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

    // Kiểm tra định kỳ trạng thái kết nối
    const interval = setInterval(() => {
      const connected = client.connected;
      console.log("📶 WebSocket status:", connected ? "✅ connected" : "❌ disconnected");

      if (!connected) {
        const token = getAuthToken();
        if (token && isTokenValid()) {
          console.log("🔁 Reconnecting WebSocket...");
          client.deactivate().then(() => {
            client = createStompClient();
            clientRef.current = client;
            client.activate();
          });
        }
      }
    }, 15000); // kiểm tra mỗi 15 giây

    return () => {
      client.deactivate();
      clearInterval(interval);
      console.log("❌ Disconnected from WebSocket");
    };
  }, [userId]);
}
