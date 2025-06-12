"use client";

import { useEffect, useRef, useCallback } from "react";
import { createStompClient } from "@/utils/socket"; // hoặc "@/lib/socket" nếu bạn dùng lib
import { getAuthToken, isTokenValid } from "@/utils/axios";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = createStompClient();

    client.onConnect = () => {
      console.log("✅ [SendMessage] STOMP connected");
      clientRef.current = client;
    };

    client.onStompError = (frame) => {
      console.error("❌ [SendMessage] STOMP error:", frame);
    };

    client.activate();

    return () => {
      client.deactivate();
      console.log("❌ [SendMessage] STOMP client deactivated");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
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

      console.log("📤 Sending message:", messageData);

      try {
        client.send("/app/chat", {}, JSON.stringify(messageData));
      } catch (error) {
        console.error("❌ Failed to send message:", error);
      }
    },
    [chatId, receiverUsername]
  );

  return sendMessage;
}
