// src/hooks/useMessageSocket.js
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useMessageSocket(chatId, { onMessage }) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();

    client.onConnect = () => {
      console.log("✅ STOMP connected");

      // Đăng ký vào đoạn chat cụ thể
      const subscription = client.subscribe(`/chat.${chatId}`, (message) => {
        const payload = JSON.parse(message.body);
        console.log("📥 Realtime message:", payload);
        onMessage?.(payload);
      });

      clientRef.current = client;
    };

    client.activate();

    return () => {
      clientRef.current?.deactivate();
    };
  }, [chatId, onMessage]);
}
