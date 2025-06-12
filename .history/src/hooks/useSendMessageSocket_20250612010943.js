"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient(() => {
      console.log("✅ useSendMessage: STOMP connected");
      setIsConnected(true);
    });

    console.log("🛠️ createStompClient result:", client);

    clientRef.current = client;
    try {
      client.activate();
      console.log("🚀 STOMP client activated");
    } catch (err) {
      console.error("❌ Failed to activate STOMP client:", err);
    }

    return () => {
      client.deactivate();
      setIsConnected(false);
      console.log("❌ useSendMessage: STOMP client deactivated");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      console.log("📡 clientRef.current at sendMessage:", client);
      console.log("✅ isConnected:", isConnected);
      console.log("🧪 typeof client.send:", typeof client?.send);

      if (!client || !isConnected || typeof client.send !== "function") {
        console.warn("⚠️ STOMP client not ready or invalid", {
          client,
          isConnected,
          hasSendFunction: typeof client?.send,
        });
        return;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      console.log("📤 Sending:", messageData);

      try {
        client.send("/app/chat", {}, JSON.stringify(messageData));
        console.log("✅ Message sent");
      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }
    },
    [chatId, receiverUsername, isConnected]
  );

  return sendMessage;
}
