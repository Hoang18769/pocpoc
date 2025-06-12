"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient(() => {
      console.log("✅ useSendMessage: STOMP connected");
      setIsConnected(true);
    });

    clientRef.current = client; // 👈 Gán ngay từ đầu, không đợi onConnect
    client.activate(); // 👈 KHÔNG ĐƯỢC QUÊN DÒNG NÀY

    return () => {
      client.deactivate();
      setIsConnected(false);
      console.log("❌ useSendMessage: STOMP client deactivated");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      if (!client || !isConnected || typeof client.send !== "function") {
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
    [chatId, receiverUsername, isConnected]
  );

  return sendMessage;
}
