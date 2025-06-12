import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useMessageSocket(chatId, { onMessage }) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const onConnect = () => {
      const client = clientRef.current;
      if (!client) return;

      console.log("✅ STOMP connected");

      const subscription = client.subscribeToChannel(`/chat.${chatId}`, (message) => {
        const payload = JSON.parse(message.body);
        console.log("📥 Realtime message:", payload);
        onMessage?.(payload);
      });

      // Clean up subscription nếu cần (optional)
      clientRef.current._subscription = subscription;
    };

    const client = createStompClient(onConnect);
    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current?._subscription?.unsubscribe?.(); // hủy subscription
      clientRef.current?.deactivate();
    };
  }, [chatId, onMessage]);
}
