"use client";

import { useEffect, useRef, useCallback } from "react";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = window.__stompClient;
      if (client?.connected) {
        clientRef.current = client;
      } else {
        console.warn("⚠️ STOMP client not connected yet.");
      }
    }
  }, []);

  const sendMessage = useCallback((text) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.warn("⚠️ WebSocket is not connected. Cannot send message.");
      return;
    }

    if (!receiverUsername || !text.trim()) {
      console.warn("⚠️ Missing receiverUsername or text content.");
      return;
    }

    const messageData = {
      chatId: chatId || null,
      username: receiverUsername.trim(),
      text: text.trim(),
    };

    try {
      client.send('/app/chat', {}, JSON.stringify(messageData));
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  }, [chatId, receiverUsername]);

  return sendMessage;
}
