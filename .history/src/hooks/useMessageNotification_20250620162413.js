"use client";
import { useEffect, useRef, useState } from "react";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { isTokenValid } from "@/utils/axios";

export default function useMessageNotification(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Store actions
  const {
    fetchChatList,
    onMessageReceived,
    onChatCreated,
  } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để cập nhật chatList
  const updateChatList = (newMessage, chatId) => {
    console.log("🔄 Processing message for chatList:", newMessage);
    
    const { chatList } = useAppStore.getState();
    console.log("📜 Current chatList:", chatList);
    
    const foundChat = chatList.find((c) => c.chatId === chatId);
    console.log("🔍 Found chat:", foundChat);

    if (foundChat) {
      console.log("🔍 Current latestMessage:", foundChat.latestMessage);
      console.log("🆕 New message structure:", {
        id: newMessage.id,
        content: newMessage.content,
        sentAt: newMessage.sentAt,
        sender: newMessage.sender
      });

      const updatedChat = {
        ...foundChat,
        latestMessage: {
          id: newMessage.id,
          content: newMessage.content,
          sentAt: newMessage.sentAt,
          sender: newMessage.sender,
          messageType: newMessage.messageType,
          attachment: newMessage.attachment,
          attachments: newMessage.attachments,
          deleted: newMessage.deleted || false
        },
        updatedAt: newMessage.sentAt,
        notReadMessageCount:
          (foundChat.notReadMessageCount || 0) + (newMessage.isOwnMessage ? 0 : 1),
      };
      
      console.log("🆕 UpdatedChat latestMessage:", updatedChat.latestMessage);
      
      const otherChats = chatList.filter((c) => c.chatId !== chatId);
      const newChatList = [...otherChats, updatedChat].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      console.log("📜 New chatList first item latestMessage:", newChatList[0]?.latestMessage);
      
      // Force update bằng cách tạo object mới hoàn toàn
      useAppStore.setState({ 
        chatList: newChatList.map(chat => ({...chat}))
      });
      
      console.log("✅ ChatList updated successfully!");
      
      // Verify update
      setTimeout(() => {
        const { chatList: updatedList } = useAppStore.getState();
        console.log("🔍 Verified latestMessage after update:", updatedList.find(c => c.chatId === chatId)?.latestMessage);
      }, 100);
    } else {
      console.warn(`⚠️ Không tìm thấy chat với chatId: ${chatId}`);
    }
  };

  useEffect(() => {
    if (!userId || !currentUserId) return;
    let isMounted = true;

    const handleMessage = async (messageData) => {
      if (!messageData) {
        console.warn("⚠️ Message data không hợp lệ:", messageData);
        return;
      }

      console.log("📨 New message received:", messageData);

      try {
        // Xử lý các loại command khác nhau
        if (messageData.command === "DELETE") {
          toast(`🗑️ Tin nhắn đã bị xóa`, {
            duration: 3000,
            position: "top-right",
          });
          return;
        }

        if (messageData.command === "EDIT") {
          const senderName = messageData.sender?.username || messageData.sender?.givenName || "ai đó";
          if (messageData.sender?.id !== currentUserId) {
            toast(`✏️ ${senderName} đã chỉnh sửa tin nhắn`, {
              duration: 3000,
              position: "top-right",
            });
          }
          return;
        }

        // NEW MESSAGE - tương tự như useChat
        const newMessage = { 
          ...messageData, 
          isOwnMessage: messageData.sender?.id === currentUserId 
        };
        
        console.log("📩 Processing new message:", newMessage);
        console.log("🆔 Current userId:", currentUserId);
        console.log("🆔 Sender ID:", messageData.sender?.id);
        
        // Cập nhật chatList ngay lập tức
        if (messageData.chatId) {
          requestAnimationFrame(() => {
            updateChatList(newMessage, messageData.chatId);
          });
        }

        // Hiển thị toast notification chỉ khi không phải tin nhắn của mình
        if (messageData.sender && messageData.content && !newMessage.isOwnMessage) {
          const senderName = messageData.sender.username || messageData.sender.givenName || "ai đó";
          toast(`💬 ${senderName}: ${messageData.content}`, {
            duration: 4000,
            position: "top-right",
          });
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
    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      if (!isMounted) return;
      console.log(`🔌 Connected to Message WebSocket [userId:${userId}]`);

      try {
        subscriptionRef.current = client.subscribe(`/message/${userId}`, (message) => {
          try {
            const messageData = JSON.parse(message.body);
            console.log("📨 Message received via STOMP:", messageData);
            handleMessage(messageData);
          } catch (err) {
            console.error("❌ Không thể parse message:", err);
          }
        });
        console.log("🔌 Subscribed to /message/" + userId);
      } catch (err) {
        console.error("❌ Lỗi khi subscribe to messages:", err);
      }
    };

    client.onDisconnect = () => {
      if (!isMounted) return;
      console.warn(`🔌 Disconnected from Message WebSocket [userId:${userId}]`);
    };

    client.onStompError = (frame) => {
      if (!isMounted) return;
      console.error("❌ Message STOMP error:", frame);
    };

    client.onWebSocketError = (err) => {
      if (!isMounted) return;
      console.error("❌ Message WebSocket error:", err);
    };

    try {
      client.activate();
      console.log("🚀 Activating message client for userId:", userId);
    } catch (err) {
      console.error("❌ Lỗi kích hoạt message client:", err);
    }

    // Setup reconnection interval tương tự useChat
    intervalRef.current = setInterval(() => {
      if (!client.connected && isTokenValid()) {
        console.log(`🔁 Reconnecting to message notification [userId:${userId}]...`);
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          newClient.onConnect = client.onConnect;
          newClient.onDisconnect = client.onDisconnect;
          newClient.onStompError = client.onStompError;
          newClient.onWebSocketError = client.onWebSocketError;
          newClient.activate();
        });
      } else {
        console.log(
          `[message:${userId}] Status: ${client.connected ? "✅ connected" : "❌ disconnected"}`
        );
      }
    }, 15000);

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

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      console.log(`❌ Cleaned up Message WebSocket [userId:${userId}]`);
    };
  }, [userId, currentUserId, fetchChatList, onMessageReceived, onChatCreated]);

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
      userId: userId,
      currentUserId: currentUserId
    };
  };

  return {
    sendMessage,
    getConnectionStatus
  };
}