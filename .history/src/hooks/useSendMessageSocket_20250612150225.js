"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient, registerOnConnect } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient();
    clientRef.current = client;

    // 👉 Đăng ký callback khi kết nối thành công
    registerOnConnect(() => {
      setIsConnected(true);
    });

    client.activate();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log("❌ STOMP client deactivated");
      }
      setIsConnected(false);
      clientRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      console.log("📡 Attempting to send...");
      console.log("✅ isConnected:", isConnected);
      console.log("📦 client.connected:", client?.connected);

      if (!client || !client.connected) {
        console.warn("⚠️ STOMP client not ready", {
          hasClient: !!client,
          isConnected: client?.connected,
          stateConnected: isConnected,
        });
        return;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      try {
        client.sendMessage("/app/chat", messageData);
        console.log("✅ Message sent:", messageData);
      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }
    },
    [chatId, receiverUsername, isConnected]
  );

  return { sendMessage, isConnected };
}
