"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient((frame) => {
      console.log("✅ STOMP connected", frame);
      setIsConnected(true);
    });

    clientRef.current = client;
    
    // Activate client
    client.activate();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      setIsConnected(false);
      clientRef.current = null;
      console.log("❌ STOMP client deactivated");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      console.log("📡 Attempting to send...");
      console.log("✅ isConnected:", isConnected);
      console.log("📦 client.connected:", client?.connected);
      console.log("📦 typeof client?.publish:", typeof client?.publish);

      // Kiểm tra client và connection status
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
        // Sử dụng publish() thay vì send()
        client.publish({
          destination: "/app/chat",
          body: JSON.stringify(messageData),
          headers: {
            'content-type': 'application/json'
          }
        });
        
        console.log("✅ Message sent:", messageData);
      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }
    },
    [chatId, receiverUsername, isConnected]
  );

  return { sendMessage, isConnected };
}