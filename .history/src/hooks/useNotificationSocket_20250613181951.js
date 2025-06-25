"use client";

import { useEffect, useRef } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";
import toast from "react-hot-toast";
import { useSocket } from "@/context/socketContext"; // Sử dụng socket context chung

export default function useNotificationSocket(userId) {
  const { client: sharedClient, isConnected } = useSocket(); // Lấy client từ context
  const subscriptionRef = useRef(null);
  const toastRef = useRef(null); // Theo dõi toast hiện tại

  // Xử lý thông báo
  const handleNotification = useRef((data) => {
    if (!data?.action) {
      console.warn("⚠️ Invalid notification format:", data);
      return;
    }

    // Đóng toast cũ nếu có
    if (toastRef.current) {
      toast.dismiss(toastRef.current);
    }

    const name = data.creator?.givenName || "Someone";
    const notificationConfig = {
      duration: 5000,
      position: "top-right",
      style: {
        background: '#333',
        color: '#fff',
      },
    };

    switch (data.action) {
      case "SENT_ADD_FRIEND_REQUEST":
        toastRef.current = toast(`${name} sent you a friend request 💌`, notificationConfig);
        break;
      case "ACCEPTED_FRIEND_REQUEST":
        toastRef.current = toast(`${name} accepted your friend request 🤝`, notificationConfig);
        break;
      case "BE_FRIEND":
        toastRef.current = toast(`You and ${name} are now friends 👥`, notificationConfig);
        break;
      case "POST_LIKED":
        toastRef.current = toast(`${name} liked your post ❤️`, notificationConfig);
        break;
      case "NEW_MESSAGE":
        // Chỉ hiển thị nếu không ở trang chat
        if (!window.location.pathname.includes('/chats')) {
          toastRef.current = toast(`${name} sent you a message 💬`, {
            ...notificationConfig,
            onClick: () => {
              // Chuyển hướng đến trang chat khi click
              window.location.href = `/chats/${data.chatId || ''}`;
            }
          });
        }
        break;
      default:
        toastRef.current = toast(`🔔 New notification from ${name}`, notificationConfig);
    }
  }).current;

  useEffect(() => {
    if (!userId || !sharedClient) return;

    let isActive = true;

    const setupNotificationSubscription = async () => {
      try {
        // Đợi kết nối nếu chưa sẵn sàng
        if (!isConnected) {
          await waitForConnection(sharedClient, 10000);
          if (!isActive) return;
        }

        console.log(`🔔 Subscribing to /user/${userId}/notifications`);
        subscriptionRef.current = sharedClient.subscribe(
          `/user/${userId}/notifications`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log("📩 Notification received:", data);
              handleNotification(data);
            } catch (err) {
              console.error("❌ Failed to parse notification:", err);
            }
          },
          { id: `notif-sub-${userId}` } // Unique subscription ID
        );
      } catch (err) {
        console.error("❌ Notification setup failed:", err);
        // Thử lại sau 5s nếu thất bại
        setTimeout(setupNotificationSubscription, 5000);
      }
    };

    setupNotificationSubscription();

    return () => {
      isActive = false;
      if (subscriptionRef.current) {
        try {
          console.log("🔕 Unsubscribing notifications");
          subscriptionRef.current.unsubscribe();
        } catch (err) {
          console.warn("⚠️ Error unsubscribing:", err);
        }
        subscriptionRef.current = null;
      }
    };
  }, [userId, sharedClient, isConnected, handleNotification]);

  // Cleanup toast khi unmount
  useEffect(() => {
    return () => {
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
      }
    };
  }, []);
}