"use client";

import { useEffect, useRef } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function useChatSocket(chatId, onMessage) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    let isActive = true;

    const initializeChatSocket = async () => {
      try {
        // Kiểm tra token trước khi kết nối
        const token = getAuthToken();
        if (!token || !isTokenValid()) {
          console.log(`⚠️ No valid token for chat:${chatId}`);
          return;
        }

        // Tạo client với callback onConnect
        const client = createStompClient(() => {
          if (!isActive) return; // Component đã unmount
          
          console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);
          
          // Subscribe vào chat channel
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/chat/${chatId}`,
              (data) => {
                console.log("📩 New message received:", data);
                handleMessage(data);
              }
            );
          } catch (error) {
            console.error(`❌ Error subscribing to chat:${chatId}:`, error);
          }
        });

        clientRef.current = client;

        // Activate client nếu chưa active
        if (!client.active) {
          client.activate();
        }

        // Đợi kết nối thành công (optional)
        try {
          await waitForConnection(client, 10000);
          console.log(`✅ Chat WebSocket connection established [chat:${chatId}]`);
        } catch (error) {
          console.warn(`⚠️ Chat WebSocket connection timeout [chat:${chatId}]:`, error);
        }

      } catch (error) {
        console.error(`❌ Error initializing chat WebSocket [chat:${chatId}]:`, error);
      }
    };

    const handleMessage = (data) => {
      if (!data) {
        console.warn("⚠️ Invalid message data:", data);
        return;
      }

      // Gọi callback từ component
      onMessage?.(data);

      // Hiển thị toast notification nếu có sender và content
      const sender = data?.sender;
      if (sender && data?.content) {
        // Có thể thêm logic để check xem user hiện tại có phải sender không
        // để tránh toast tin nhắn của chính mình
        toast(`💬 ${sender.username}: ${data.content}`, {
          duration: 4000,
          position: "top-right",
        });
      }
    };

    // Khởi tạo socket connection
    initializeChatSocket();

    // Cleanup function
    return () => {
      isActive = false;
      
      // Unsubscribe khỏi chat channel
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log(`📤 Unsubscribed from chat:${chatId}`);
        } catch (error) {
          console.warn(`⚠️ Error unsubscribing from chat:${chatId}:`, error);
        }
        subscriptionRef.current = null;
      }

      console.log(`❌ Cleaned up WebSocket [chat:${chatId}]`);
    };
  }, [chatId, onMessage]);

  // Helper method để gửi tin nhắn (optional)
  const sendMessage = (messageData) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.error(`❌ Cannot send message to chat:${chatId} - client not connected`);
      return false;
    }

    return client.sendMessage(`/app/chat/${chatId}`, messageData);
  };

  // Return utilities nếu cần sử dụng bên ngoài
  return {
    client: clientRef.current,
    sendMessage,
    isConnected: clientRef.current?.connected || false
  };
}