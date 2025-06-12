// src/hooks/useChatSocket.js
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useChatSocket(userId, { onNewMessage }) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const client = createStompClient();

    client.onConnect = () => {
      console.log("✅ STOMP connected");

      // Gửi đến user khi có tin nhắn mới
      client.subscribe(`/user/${userId}/queue/messages`, (message) => {
        const payload = JSON.parse(message.body);
        console.log("📥 Message for chat list:", payload);
        onNewMessage?.(payload);
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId, onNewMessage]);
}
