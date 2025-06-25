"use client";
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useOnlineNotification(userId) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    // === Setup socket client ===
    const client = createStompClient((frame) => {
      if (!isMounted) return;

      console.log("🔌 Subscribing to /online/" + userId);
      try {
        subscriptionRef.current = client.subscribeToChannel(
          `/online/${userId}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log("📨 Received online status:", data);
              
              // Xử lý online status ở đây
              // Ví dụ: cập nhật store hoặc UI
              
            } catch (err) {
              console.error("❌ Không thể parse message:", err);
            }
          }
        );
      } catch (err) {
        console.error("❌ Lỗi khi subscribe:", err);
      }
    });

    clientRef.current = client;

    try {
      client.activate();
    } catch (err) {
      console.error("❌ Lỗi kích hoạt client:", err);
    }

    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /online");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký:", err);
        }
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
          console.log("🔌 Đã ngắt kết nối client");
        } catch (err) {
          console.warn("⚠️ Lỗi khi ngắt kết nối:", err);
        }
        clientRef.current = null;
      }
    };
  }, [userId]);

  return null;
}