"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";

export default function useChatSocket(chatId, onMessage) {
  const clientRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);

      client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          onMessage?.(data);
        } catch (err) {
          console.error("❌ Error parsing message:", err);
        }
      });
    };

    client.onDisconnect = () => {
      console.warn(`🔌 Disconnected from WebSocket [chat:${chatId}]`);
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error:", frame);
    };

    client.onWebSocketError = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    client.activate();

    // Check alive every 15s
    intervalRef.current = setInterval(() => {
      const connected = client.connected;
      console.log(`[chat:${chatId}] Status: ${connected ? "✅ connected" : "❌ disconnected"}`);

      if (!connected) {
        const token = getAuthToken();
        if (token && isTokenValid()) {
          console.log("🔁 Attempting to reconnect...");
          client.deactivate().then(() => {
            const newClient = createStompClient();
            clientRef.current = newClient;
            newClient.onConnect = client.onConnect;
            newClient.activate();
          });
        } else {
          console.warn("⛔ Token invalid, will not reconnect.");
        }
      }
    }, 15000);

    return () => {
      client.deactivate();
      clearInterval(intervalRef.current);
      console.log(`❌ Cleaned up WebSocket [chat:${chatId}]`);
    };
  }, [chatId]);
}
