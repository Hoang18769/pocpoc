"use client";
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useNotificationSocket(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);

  // Store actions
  const {
    fetchChatList,
    onMessageReceived,
    onChatCreated,
    fetchNotifications,
    onNotificationReceived,
  } = useAppStore();

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const handleNotification = async (data) => {
      if (!data?.action) {
        console.warn("⚠️ Notification không hợp lệ:", data);
        return;
      }

      const name = data.creator?.givenName || "ai đó";

      // === Toast & store updates by action ===
      switch (data.action) {
        case "SENT_ADD_FRIEND_REQUEST":
          toast(`${name} đã gửi lời mời kết bạn 💌`);
          break;

        case "BE_FRIEND":
        case "ACCEPTED_FRIEND_REQUEST":
          toast(`${name} đã trở thành bạn bè 👥`);
          break;

        case "POST":
          toast(`${name} đã đăng một bài viết mới`);
          break;

        case "SHARE":
          toast(`${name} đã chia sẻ một bài viết mới`);
          break;

        case "LIKE_POST":
          toast(`${name} đã thích bài viết của bạn ❤️`);
          break;

        case "COMMENT":
          toast(`${name} đã bình luận về bài viết của bạn 💬`);
          break;

        case "REPLY_COMMENT":
          toast(`${name} đã trả lời bình luận của bạn 💬`);
          break;

        case "NEW_MESSAGE":
          toast(`${name} đã nhắn tin cho bạn 💬`);

          try {
            // Cập nhật nhanh nội dung chat
            if (data.message) {
              onMessageReceived(data.message);
            }

            // Làm mới danh sách chat để cập nhật vị trí & số lượng tin chưa đọc
            await fetchChatList();
            console.log("✅ Chat list updated after new message notification");
          } catch (error) {
            console.error("❌ Failed to update chat list:", error);
          }
          break;

        case "NEW_CHAT_CREATED":
          if (data.chat) {
            onChatCreated(data.chat);
            toast(`${name} đã tạo cuộc trò chuyện mới 💬`);
          }
          break;

        default:
          toast(`🔔 Có thông báo mới từ ${name}`);
      }

      // ✅ Đồng bộ thông báo vào store
      if (onNotificationReceived && fetchNotifications) {
        onNotificationReceived(data); // Tạm thời hiển thị ngay

        // Sync lại từ server để đảm bảo không thiếu
        // setTimeout(() => {
        //   fetchNotifications(true);
        // }, 300); // delay nhẹ tránh spam call nếu nhận liên tục
      }
    };

    // === Setup socket client ===
    const client = createStompClient((frame) => {
      if (!isMounted) return;

      console.log("🔌 Subscribing to /notifications/" + userId);
      try {
        subscriptionRef.current = client.subscribeToChannel(
          `/notifications/${userId}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log("📨 Notification received:", data);
              handleNotification(data);
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
          console.log("📤 Đã hủy đăng ký /notifications");
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
  }, [userId, fetchChatList, onMessageReceived, onChatCreated, fetchNotifications, onNotificationReceived]);
}
