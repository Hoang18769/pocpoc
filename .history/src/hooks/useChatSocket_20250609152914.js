// src/hooks/useChatSocket.js
import { useEffect, useRef } from "react";
import { createStompClient } from "@/lib/socket";

export default function useChatSocket({ onMessageReceived }) {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = createStompClient();

    client.onConnect = () => {
      console.log("✅ STOMP connected");

      // Nhận tin nhắn đến user hiện tại
      client.subscribe("/user/message", (message) => {
        const payload = JSON.parse(message.body);
        console.log("📥 Message received:", payload);
        onMessageReceived?.(payload);
      });

      // client.subscribe("/user/chat"
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [onMessageReceived]);

  const sendMessage = (chatMessage) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(chatMessage),
      });
    } else {
      console.warn("STOMP client not connected");
    }
  };

  return { sendMessage };
}
