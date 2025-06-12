"use client";

import { useEffect, useRef, useCallback } from "react";

export default function useSendMessage(chatId) {
  const clientRef = useRef(null);

  useEffect(() => {
    // Lấy STOMP client từ window nếu tồn tại và đã kết nối
    if (typeof window !== "undefined") {
      const client = window.__stompClient;
      if (client?.connected) {
        clientRef.current = client;
      } else {
        console.warn("⚠️ STOMP client not connected yet.");
      }
    }
  }, []);

  const sendMessage = useCallback((content) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.warn("⚠️ WebSocket is not connected. Cannot send message.");
      return;
    }

    if (!chatId || !content) {
      console.warn("⚠️ Missing chatId or content.");
      return;
    }

    const message = {
      chatId,
      content,
    };

    try {
      client.publish({
        destination: "/app/chat",
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  }, [chatId]);

  return sendMessage;
}
