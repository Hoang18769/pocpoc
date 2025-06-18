"use client";
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useNotificationSocket(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);
  
  // Get store methods
  const { 
    fetchChatList, 
    onMessageReceived,
    onChatCreated,
    // fetchNotifications, // Uncomment khi implement notifications
    // onNotificationReceived // Uncomment khi implement notifications
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
      
      // Handle different notification types and trigger store updates
      switch (data.action) {
        case "SENT_ADD_FRIEND_REQUEST":
          toast(`${name} đã gửi lời mời kết bạn 💌`);
          // Trigger fetch notifications if implemented
          // fetchNotifications && fetchNotifications();
          break;
          
        case "BE_FRIEND":
        case "ACCEPTED_FRIEND_REQUEST":
          toast(`${name} đã trở thành bạn bè 👥`);
          // Trigger fetch notifications if implemented
          // fetchNotifications && fetchNotifications();
          break;
          
        case "POST":
          toast(`${name} đã đăng một bài viết mới`);
          // Trigger newsfeed refresh if implemented
          // fetchNewsFeed && fetchNewsFeed();
          break;
          
        case "SHARE":
          toast(`${name} đã chia sẻ một bài viết mới`);
          // Trigger newsfeed refresh if implemented
          // fetchNewsFeed && fetchNewsFeed();
          break;
          
        case "LIKE_POST":
          toast(`${name} đã thích bài viết của bạn ❤️`);
          // Update specific post if implemented
          break;
          
        case "COMMENT":
          toast(`${name} đã bình luận về bài viết của bạn`);
          // Update specific post if implemented
          break;
          
        case "REPLY_COMMENT":
          toast(`${name} đã trả lời bình luận`);
          // Update specific post if implemented
          break;
          
        case "NEW_MESSAGE":
          toast(`${name} đã nhắn tin cho bạn 💬`);
          
          // **KEY UPDATE**: Refresh chat list when new message arrives
          try {
            // Option 1: Full refresh chat list
            await fetchChatList();
            
            // Option 2: If you have message data, update specific chat
            if (data.message) {
              onMessageReceived(data.message);
            }
            
            console.log("✅ Chat list updated after new message notification");
          } catch (error) {
            console.error("❌ Failed to update chat list:", error);
          }
          break;
          
        case "NEW_CHAT_CREATED":
          // Handle new chat creation
          if (data.chat) {
            onChatCreated(data.chat);
            toast(`${name} đã tạo cuộc trò chuyện mới 💬`);
          }
          break;
          
        default:
          toast(`🔔 Có thông báo mới từ ${name}`);
          // General notification - fetch notifications list
          // fetchNotifications && fetchNotifications();
      }
      
      // Add notification to store if implemented
      // if (onNotificationReceived) {
      //   onNotificationReceived(data);
      // }
    };

    // Khởi tạo client với callback onConnect
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

    // Kích hoạt kết nối
    try {
      client.activate();
    } catch (err) {
      console.error("❌ Lỗi kích hoạt client:", err);
    }

    return () => {
      isMounted = false;

      // Cleanup subscription
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /notifications");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký:", err);
        }
        subscriptionRef.current = null;
      }

      // Cleanup client
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
  }, [userId, fetchChatList, onMessageReceived, onChatCreated]);
}