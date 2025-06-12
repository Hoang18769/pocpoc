import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useChatSocket(chatId, { onMessage, onCommand }) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();

    client.onConnect = () => {
      console.log("🔗 Connected to STOMP");

      // Nhận tin nhắn mới và command (edit/delete)
      client.subscribe(`/chat/${chatId}`, (message) => {
        const data = JSON.parse(message.body);

        if (data.command) {
          onCommand?.(data); // Xử lý command
        } else {
          onMessage?.(data); // Thêm message vào khung chat
        }
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [chatId, onMessage, onCommand]);

  return null; // Hook không cần trả gì
}
