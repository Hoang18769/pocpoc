"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient(() => {
      console.log("✅ STOMP connected");
      clientRef.current = client; // ✅ Chỉ gán khi đã kết nối thành công
      setIsConnected(true);
    });

    client.activate(); // Chỉ activate sau khi đã setup onConnect

    return () => {
      client.deactivate();
      setIsConnected(false);
      clientRef.current = null;
      console.log("❌ STOMP client deactivated");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      console.log("📡 Attempting to send...");
      console.log("✅ isConnected:", isConnected);
      console.log("📦 typeof client?.send:", typeof client?.send);

      if (!client || !isConnected || typeof client.send !== "function") {
        console.warn("⚠️ STOMP client not ready", {
          client,
          isConnected,
          hasSend: typeof client?.send,
        });
        return;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      try {
        client.send("/app/chat", {}, JSON.stringify(messageData));
        console.log("✅ Message sent:", messageData);
      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }
    },
    [chatId, receiverUsername, isConnected]
  );

  return sendMessage;
}
