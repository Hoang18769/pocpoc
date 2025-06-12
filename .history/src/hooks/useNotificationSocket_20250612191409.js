"use client";

import { useEffect, useRef } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";
import toast from "react-hot-toast";

export default function useNotificationSocket(userId) {
  const notificationSubRef = useRef(null);
  const errorSubRef = useRef(null);

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

    const handleSocketError = (data) => {
      const message = data?.message || "Lỗi không xác định từ máy chủ";
      toast.error(`❗️Lỗi: ${message}`);
    };

    const initialize = async () => {
      try {
        console.log("📡 Kết nối WebSocket...");
        client.onConnect = () => {
          console.log("✅ Đã kết nối WebSocket");
        };
        client.onDisconnect = () => {
          console.warn("🔌 WebSocket đã bị ngắt");
        };
        client.onStompError = (frame) => {
          console.error("❌ STOMP error:", frame);
        };

        client.activate();
        await waitForConnection(client, 10000);
        if (!isMounted) return;

        // Subcribe vào notification
        console.log("🔔 Subscribing to /notifications/" + userId);
        notificationSubRef.current = client.subscribeToChannel(
          `/notifications/${userId}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              handleNotification(data);
            } catch (err) {
              console.error("❌ Không thể parse notification:", err);
            }
          }
        );

        // Subcribe vào error
        console.log("🚨 Subscribing to /error/" + userId);
        errorSubRef.current = client.subscribeToChannel(
          `/error/${userId}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              handleSocketError(data);
            } catch (err) {
              console.error("❌ Không thể parse error message:", err);
            }
          }
        );
      } catch (err) {
        console.error("❌ Lỗi khi kết nối WebSocket:", err);
      }
    };

    initialize();

    return () => {
      isMounted = false;

      if (notificationSubRef.current) {
        try {
          notificationSubRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /notifications");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký notification:", err);
        }
        notificationSubRef.current = null;
      }

      if (errorSubRef.current) {
        try {
          errorSubRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /error");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký error:", err);
        }
        errorSubRef.current = null;
      }
    };
  }, [userId]);
}
