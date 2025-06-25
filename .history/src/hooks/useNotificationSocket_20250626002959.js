"use client";
import { useEffect, useRef } from "react";
import { getStompClient } from "@/utils/socket";
import toast from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useNotificationSocket(userId) {
  const subscriptionRef = useRef(null);
  const isSubscribedRef = useRef(false);

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

        case "NEW_MESSAGE": {
          toast(`${name} đã nhắn tin cho bạn 💬`);
          try {
            if (!data.message || !data.message.senderUsername) break;

            const senderUsername = data.message.senderUsername;

            // Truy xuất chatList từ store
            const { chatList } = useAppStore.getState();

            const foundChat = chatList.find(
              (chat) => chat.target?.username === senderUsername
            );

            if (foundChat) {
              const updatedChat = {
                ...foundChat,
                lastMessage: {
                  ...foundChat.lastMessage,
                  body: data.message.body,
                },
                updatedAt: data.message.createdAt || new Date().toISOString(),
                notReadMessageCount: (foundChat.notReadMessageCount || 0) + 1,
              };

              // Tạo chatList mới: chat này đứng đầu, còn lại giữ nguyên nhưng sắp theo updatedAt
              const newChatList = [
                updatedChat,
                ...chatList
                  .filter((chat) => chat.id !== foundChat.id)
                  .sort(
                    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
                  ),
              ];

              useAppStore.setState({ chatList: newChatList });

              console.log(
                "📥 Cập nhật chatList với NEW_MESSAGE từ",
                senderUsername
              );
            } else {
              console.log(
                "🔍 Không tìm thấy chat với",
                senderUsername,
                "- giữ nguyên danh sách."
              );
            }

            // Optionally gọi lại onMessageReceived để cập nhật nếu bạn vẫn muốn
            useAppStore.getState().onMessageReceived(data.message);
          } catch (err) {
            console.error("❌ Failed to process NEW_MESSAGE:", err);
          }

          break;
        }

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
        // }, 300);
        //  // delay nhẹ tránh spam call nếu nhận liên tục
      }
    };

    // === Setup socket client với singleton ===
    const setupConnection = async () => {
      try {
        console.log("🔌 Connecting to notification socket for user:", userId);
        
        const client = await getStompClient(() => {
          if (!isMounted || isSubscribedRef.current) return;

          console.log("🔌 Subscribing to /notifications/" + userId);
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/notifications/${userId}`,
              (message) => {
                if (!isMounted) return;
                try {
                  const data = JSON.parse(message.body);
                  console.log("📨 Notification received:", data);
                  handleNotification(data);
                } catch (err) {
                  console.error("❌ Không thể parse message:", err);
                }
              }
            );
            
            if (subscriptionRef.current) {
              isSubscribedRef.current = true;
              console.log("✅ Successfully subscribed to notifications");
            }
          } catch (err) {
            console.error("❌ Lỗi khi subscribe:", err);
          }
        });

        // Nếu client đã connected và chưa subscribe
        if (client?.connected && !isSubscribedRef.current) {
          console.log("🔌 Client already connected, subscribing immediately");
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/notifications/${userId}`,
              (message) => {
                if (!isMounted) return;
                try {
                  const data = JSON.parse(message.body);
                  console.log("📨 Notification received:", data);
                  handleNotification(data);
                } catch (err) {
                  console.error("❌ Không thể parse message:", err);
                }
              }
            );
            
            if (subscriptionRef.current) {
              isSubscribedRef.current = true;
              console.log("✅ Successfully subscribed to notifications");
            }
          } catch (err) {
            console.error("❌ Lỗi khi subscribe:", err);
          }
        }

      } catch (err) {
        console.error("❌ Lỗi khi setup connection:", err);
      }
    };

    setupConnection();

    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /notifications/" + userId);
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký:", err);
        }
        subscriptionRef.current = null;
      }
      
      isSubscribedRef.current = false;
    };
  }, [
    userId,
    fetchChatList,
    onMessageReceived,
    onChatCreated,
    fetchNotifications,
    onNotificationReceived,
  ]);
}