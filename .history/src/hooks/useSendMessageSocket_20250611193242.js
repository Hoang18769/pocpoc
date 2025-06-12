"use client";

import { useEffect, useRef, useCallback } from "react";

export default function useSendMessage(chatId) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__stompClient?.connected) {
      clientRef.current = window.__stompClient;
    }
  }, [chatId]);

  const sendMessage = useCallback((content) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("⚠️ WebSocket is not connected. Cannot send message.");
      return;
    }

    const message = {
      chatId,
      content,
    };

    client.publish({
      destination: "/app/chat", // server-side endpoint xử lý gửi
      body: JSON.stringify(message),
    });
  }, [chatId]);

  return sendMessage;
}
