"use client";
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useMessageNotification(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);

  // Store actions
  const {
    fetchChatList,
    onMessageReceived,
    onChatCreated,
  } = useAppStore();

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const handleMessage = async (messageData) => {
      if (!messageData) {
        console.warn("⚠️ Message data không hợp lệ:", messageData);
        return;
      }

      console.log("📨 New message received:", messageData);
      toast()

      // Cập nhật chatList nếu có thông tin message
      try {
        if (messageData.senderUsername) {
          // Truy xuất chatList từ store
          const { chatList } = useAppStore.getState();

          const foundChat = chatList.find(
            (chat) => chat.target?.username === messageData.senderUsername
          );

          if (foundChat) {
            const updatedChat = {
              ...foundChat,
              lastMessage: {
                ...foundChat.lastMessage,
                body: messageData.content || messageData.message || messageData.body,
              },
              updatedAt: messageData.createdAt || new Date().toISOString(),
              notReadMessageCount: (foundChat.notReadMessageCount || 0) + 1,
            };

            // Tạo chatList mới: chat này đứng đầu, còn lại giữ nguyên nhưng sắp theo updatedAt
            const newChatList = [
              updatedChat,
              ...chatList
                .filter((chat) => chat.id !== foundChat.id)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
            ];

            useAppStore.setState({ chatList: newChatList });

            console.log("📥 Cập nhật chatList với message từ", messageData.senderUsername);
          } else {
            console.log("🔍 Không tìm thấy chat với", messageData.senderUsername, "- giữ nguyên danh sách.");
          }
        }

        // Gọi onMessageReceived để cập nhật store
        if (onMessageReceived) {
          onMessageReceived(messageData);
        }

        // Dispatch custom event để các component khác có thể listen
        window.dispatchEvent(new CustomEvent('newMessageReceived', {
          detail: messageData
        }));

      } catch (err) {
        console.error("❌ Failed to process message:", err);
      }
    };

    // === Setup socket client ===
    const client = createStompClient((frame) => {
      if (!isMounted) return;

      console.log("🔌 Subscribing to /message/" + userId);
      try {
        subscriptionRef.current = client.subscribeToChannel(
          `/message/${userId}`,
          (message) => {
            try {
              const messageData = JSON.parse(message.body);
              console.log("📨 Message received via STOMP:", messageData);
              handleMessage(messageData);
            } catch (err) {
              console.error("❌ Không thể parse message:", err);
            }
          }
        );
      } catch (err) {
        console.error("❌ Lỗi khi subscribe to messages:", err);
      }
    });

    clientRef.current = client;

    try {
      client.activate();
      console.log("🚀 Activating message client for userId:", userId);
    } catch (err) {
      console.error("❌ Lỗi kích hoạt message client:", err);
    }

    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /message");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký message:", err);
        }
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
          console.log("🔌 Đã ngắt kết nối message client");
        } catch (err) {
          console.warn("⚠️ Lỗi khi ngắt kết nối message client:", err);
        }
        clientRef.current = null;
      }
    };
  }, [userId, fetchChatList, onMessageReceived, onChatCreated]);

  // Method để gửi message qua STOMP client (nếu cần)
  const sendMessage = (destination, message) => {
    if (clientRef.current && clientRef.current.connected) {
      try {
        clientRef.current.publish({
          destination: destination,
          body: JSON.stringify(message)
        });
        console.log("📤 Message sent via STOMP:", message);
      } catch (error) {
        console.error("❌ Error sending message via STOMP:", error);
      }
    } else {
      console.warn("⚠️ STOMP client is not connected");
    }
  };

  // Debug function để kiểm tra connection status
  const getConnectionStatus = () => {
    return {
      isConnected: clientRef.current?.connected || false,
      hasSubscription: !!subscriptionRef.current,
      userId: userId
    };
  };

  return {
    sendMessage,
    getConnectionStatus
  };
}