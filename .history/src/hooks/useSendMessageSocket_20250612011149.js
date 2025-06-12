"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient(() => {
      console.log("✅ STOMP connected, assigning clientRef");
      clientRef.current = client; // ✅ Gán sau khi chắc chắn đã kết nối
      setIsConnected(true);
    });

    console.log("🛠️ STOMP client initialized:", client);
    client.activate(); // 🚀 Luôn cần gọi activate()

    return () => {
      client.deactivate();
      setIsConnected(false);
      console.log("❌ STOMP client deactivated");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      console.log("📡 Attempt to send. isConnected:", isConnected);
      console.log("📦 clientRef.current:", client);
      console.log("📬 typeof send:", typeof client?.send);

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
