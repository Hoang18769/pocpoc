// src/hooks/useNotificationSocket.js
"use client";

import { useEffect, useRef } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";
import toast from "react-hot-toast";
import { getAuthToken, isTokenValid } from "@/utils/axios";

export default function useNotificationSocket(userId) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    let isActive = true;
    
    const initializeSocket = async () => {
      try {
        // Kiểm tra token trước khi kết nối
        const token = getAuthToken();
        if (!token || !isTokenValid()) {
          console.log("⚠️ No valid token available for WebSocket connection");
          return;
        }

        // Tạo client với callback onConnect
        const client = createStompClient(() => {
          if (!isActive) return; // Component đã unmount
          
          console.log("🔌 WebSocket connected, setting up notification subscription");
          
          // Subscribe vào channel notification
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/notifications/${userId}`,
              (data) => {
                console.log("🔔 Notification received:", data);
                handleNotification(data);
              }
            );
          } catch (error) {
            console.error("❌ Error subscribing to notifications:", error);
          }
        });

        clientRef.current = client;

        // Activate client nếu chưa active
        if (!client.active) {
          client.activate();
        }

        // Đợi kết nối thành công (optional)
        try {
          await waitForConnection(client, 10000);
          console.log("✅ WebSocket connection established");
        } catch (error) {
          console.warn("⚠️ WebSocket connection timeout:", error);
        }

      } catch (error) {
        console.error("❌ Error initializing WebSocket:", error);
      }
    };

    const handleNotification = (data) => {
      if (!data || !data.action) {
        console.warn("⚠️ Invalid notification data:", data);
        return;
      }

      const creatorName = data.creator?.givenName || "ai đó";

      switch (data.action) {
        case "SENT_ADD_FRIEND_REQUEST":
          toast(`${creatorName} đã gửi lời mời kết bạn 💌`);
          break;
        case "ACCEPTED_FRIEND_REQUEST":
          toast(`${creatorName} đã chấp nhận lời mời kết bạn 🤝`);
          break;
        case "BE_FRIEND":
          toast(`${creatorName} đã trở thành bạn bè 👥`);
          break;
        case "POST_LIKED":
          toast(`${creatorName} đã thích bài viết của bạn ❤️`);
          break;
        case "NEW_MESSAGE":
          toast(`${creatorName} đã nhắn tin cho bạn 💬`);
          break;
        default:
          toast(`🔔 Có thông báo mới từ ${creatorName}`);
          break;
      }
    };

    // Khởi tạo socket connection
    initializeSocket();

    // Cleanup function
    return () => {
      isActive = false;
      
      // Unsubscribe khỏi channel
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Unsubscribed from notifications");
        } catch (error) {
          console.warn("⚠️ Error unsubscribing:", error);
        }
        subscriptionRef.current = null;
      }

      console.log("❌ useNotificationSocket cleanup completed");
    };
  }, [userId]);

  // Return client reference nếu cần sử dụng bên ngoài
  return clientRef.current;
}