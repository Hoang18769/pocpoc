"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

function waitUntilConnected(client, interval = 200, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (client && client.connected) {
        resolve(true);
      } else if (Date.now() - start > timeout) {
        reject(new Error("STOMP connection timeout"));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient();
    clientRef.current = client;

    client.activate();

    waitUntilConnected(client)
      .then(() => {
        console.log("✅ STOMP ready (confirmed by polling)");
        setIsConnected(true);
      })
      .catch((err) => {
        console.error("❌ STOMP failed to connect:", err);
      });

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
