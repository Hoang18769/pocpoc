"use client";

import { useCallback } from "react";
import { useSocket } from "./SocketContext"; // Điều chỉnh đường dẫn theo cấu trúc dự án

export default function useSendMessage({ chatId, receiverUsername }) {
  const { client: stompClient, isConnected } = useSocket();

  const sendMessage = useCallback(
    (text) => {
      console.log("📡 Attempting to send...");
      console.log("✅ isConnected:", isConnected);
      console.log("📦 stompClient.connected:", stompClient?.connected);
      console.log("📦 typeof stompClient?.publish:", typeof stompClient?.publish);

      // Kiểm tra client và connection status
      if (!stompClient || !stompClient.connected) {
        console.warn("⚠️ STOMP client not ready", {
          hasClient: !!stompClient,
          isConnected: stompClient?.connected,
          stateConnected: isConnected,
        });
        return false;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      try {
        stompClient.publish({
          destination: "/app/chat",
          body: JSON.stringify(messageData),
          headers: {
            'content-type': 'application/json'
          }
        });
        
        console.log("✅ Message sent:", messageData);
        return true;
      } catch (err) {
        console.error("❌ Failed to send message:", err);
        return false;
      }
    },
    [chatId, receiverUsername, isConnected, stompClient]
  );

  return { sendMessage, isConnected };
}