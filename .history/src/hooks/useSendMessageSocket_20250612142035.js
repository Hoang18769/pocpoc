"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient();

    client.onConnect = (frame) => {
      console.log("✅ STOMP connected", frame);
      setIsConnected(true);
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error", frame);
    };

    client.onWebSocketError = (event) => {
      console.error("❌ WebSocket error", event);
    };

    clientRef.current = client;
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

      if (!client || !client.connected) {
        console.warn("⚠️ STOMP client not ready", {
          hasClient: !!client,
          isConnected: client?.connected,
        });
        return;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      try {
        client.publish({
          destination: "/app/chat",
          body: JSON.stringify(messageData),
          headers: {
            'content-type': 'application/json',
          },
        });

        console.log("✅ Message sent:", messageData);
      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }
    },
    [chatId, receiverUsername]
  );

  return { sendMessage, isConnected };
}
