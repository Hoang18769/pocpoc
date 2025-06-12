"use client";

import { useEffect, useRef, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = createStompClient(() => {
      console.log("✅ useSendMessage: STOMP connected");
      clientRef.current = client;
    });

    return () => {
      client.deactivate();
      console.log("❌ useSendMessage: STOMP client deactivated");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      if (!client || !client.connected || typeof client.send !== "function") {
        console.warn("⚠️ STOMP client not ready or invalid");
        return;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      console.log("📤 Sending:", messageData);

      try {
        client.send("/app/chat", {}, JSON.stringify(messageData));
      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }
    },
    [chatId, receiverUsername]
  );

  return sendMessage;
}
