"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/lib/socket";
import toast from "react-hot-toast";

export default function useNotificationSocket(userId) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const client = createStompClient();
    clientRef.current = client;

    let intervalId = null;

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

    client.activate();

    // Kiểm tra trạng thái WebSocket mỗi 10s
    intervalId = setInterval(() => {
      const isConnected = client.connected;
      console.log(`🩺 WebSocket status: ${isConnected ? "🟢 Connected" : "🔴 Disconnected"}`);
      if (!isConnected && client.active) {
        console.log("🧠 Trying to reconnect WebSocket...");
        client.deactivate();
        client.activate();
      }
    }, 10000);

    return () => {
      client.deactivate();
      if (intervalId) clearInterval(intervalId);
      console.log("❌ Disconnected from WebSocket");
    };
  }, [userId]);
}
