"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";

export default function useNotificationSocket(userId) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

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
        case "LIKE_POST":
          toast(`${name} đã thích bài viết của bạn ❤️`);
          break;
          case "POST":
          toast(`${name} đã thêm một bài viết mới`);
          break;
        case "NEW_MESSAGE":
          toast(`${name} đã nhắn tin cho bạn 💬`);
          break;
        default:
          toast(`🔔 Có thông báo mới từ ${name}`);
      }
    };

    const client = createStompClient((frame) => {
      console.log("🔌 Subscribed to /notifications/" + userId);
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
    });

    clientRef.current = client;
    client.activate();

    return () => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Hủy đăng ký /notifications");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký:", err);
        }
      }

      if (clientRef.current) {
        clientRef.current.deactivate().then(() => {
          console.log("🔌 STOMP client deactivated");
        });
      }
    };
  }, [userId]);
}
