"use client";

import { useEffect, useRef } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";
import toast from "react-hot-toast";

export default function useNotificationSocket(userId) {
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const client = createStompClient();

    const handleNotification = (data) => {
      if (!data?.action) {
        console.warn("⚠️ Notification không hợp lệ:", data);
        return;
      }

      const name = data.creator?.givenName || "ai đó";
      switch (data.action) {
        case "SENT_ADD_FRIEND_REQUEST":
          toast(`${name} đã gửi lời mời kết bạn 💌`);
          break;
        case "ACCEPTED_FRIEND_REQUEST":
          toast(`${name} đã chấp nhận lời mời kết bạn 🤝`);
          break;
        case "BE_FRIEND":
          toast(`${name} đã trở thành bạn bè 👥`);
          break;
        case "POST_LIKED":
          toast(`${name} đã thích bài viết của bạn ❤️`);
          break;
        case "NEW_MESSAGE":
          toast(`${name} đã nhắn tin cho bạn 💬`);
          break;
        default:
          toast(`🔔 Có thông báo mới từ ${name}`);
      }
    };

    // Kích hoạt client và subscribe channel
    const initialize = async () => {
      try {
        client.activate();
        // await waitForConnection(client, 10000);
        if (!isMounted) return;

        console.log("🔌 Subscribing to /notifications/" + userId);
        subscriptionRef.current = client.subscribeToChannel(
          `/notifications/${userId}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              handleNotification(data);
            } catch (err) {
              console.error("❌ Không thể parse message:", err);
            }
          }
        );
      } catch (err) {
        console.error("❌ Lỗi kết nối WebSocket:", err);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /notifications");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký:", err);
        }
        subscriptionRef.current = null;
      }
    };
  }, [userId]);
}
