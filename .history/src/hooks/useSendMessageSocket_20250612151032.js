"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient();
    clientRef.current = client;

    client.activate();

    waitForConnection(client)
      .then(() => {
        console.log("✅ STOMP connected (via waitForConnection)");
        setIsConnected(true);
      })
      .catch((err) => {
        console.error("❌ STOMP failed to connect:", err);
        setIsConnected(false);
      });

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log("❌ STOMP client deactivated");
        clientRef.current = null;
      }
      setIsConnected(false);
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      if (!client || !client.connected) {
        console.warn("⚠️ STOMP client not connected. Message not sent.");
        return;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      const success = client.sendMessage("/app/chat", messageData);
      if (success) {
        console.log("✅ Message sent:", messageData);
      } else {
        console.error("❌ Failed to send message");
      }
    },
    [chatId, receiverUsername]
  );

  return { sendMessage, isConnected };
}
