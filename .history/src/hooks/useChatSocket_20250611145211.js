"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";

export default function useChatSocket(chatId, onMessage) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    let client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket for chat ${chatId}`);

      client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("💬 New chat message:", data);
          onMessage?.(data);
        } catch (err) {
          console.error("❌ Failed to parse chat message:", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error", frame);
    };

    client.activate();

    const interval = setInterval(() => {
      const connected = client.connected;
      console.log("📶 Chat WebSocket status:", connected ? "✅ connected" : "❌ disconnected");

      if (!connected) {
        const token = getAuthToken();
        if (token && isTokenValid()) {
          console.log("🔁 Reconnecting Chat WebSocket...");
          client.deactivate().then(() => {
            client = createStompClient();
            clientRef.current = client;
            client.activate();
          });
        }
      }
    }, 15000);

    return () => {
      client.deactivate();
      clearInterval(interval);
      console.log(`❌ Disconnected from WebSocket chat ${chatId}`);
    };
  }, [chatId, onMessage]);
}
