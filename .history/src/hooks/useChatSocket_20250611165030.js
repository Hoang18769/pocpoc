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
      console.log(`🔌 [chat:${chatId}] Connected to WebSocket`);

      client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("💬 [chat] New message:", data);
          onMessage?.(data);
        } catch (err) {
          console.error("❌ [chat] Failed to parse message:", err);
        }
      });
    };

    client.onDisconnect = () => {
      console.log(`🚪 [chat:${chatId}] Disconnected from WebSocket`);
    };

    client.onWebSocketClose = (evt) => {
      console.warn(`⚠️ [chat:${chatId}] WebSocket closed`, evt.reason || evt);
    };

    client.onStompError = (frame) => {
      console.error("❌ [chat] STOMP error", frame);
    };

    client.onWebSocketError = (err) => {
      console.error("❌ [chat] WebSocket error", err);
    };

    client.activate();

    const interval = setInterval(() => {
      const connected = client.connected;
      console.log(`📶 [chat:${chatId}] WebSocket status: ${connected ? "✅ connected" : "❌ disconnected"}`);

      if (!connected) {
        const token = getAuthToken();
        if (token && isTokenValid()) {
          console.log("🔁 [chat] Attempting to reconnect...");
          client.deactivate().then(() => {
            client = createStompClient();
            clientRef.current = client;
            client.activate();
          });
        } else {
          console.log("⛔ [chat] Token invalid, not reconnecting.");
        }
      }
    }, 15000);

    return () => {
      client.deactivate();
      clearInterval(interval);
      console.log(`❌ [chat:${chatId}] Cleaned up WebSocket`);
    };
  }, [chatId, onMessage]);
}
