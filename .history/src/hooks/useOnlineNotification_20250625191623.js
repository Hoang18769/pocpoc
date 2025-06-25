"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useOnlineNotification(userId) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`✅ Connected to STOMP as user ${userId}`);

      subscriptionRef.current = client.subscribe(`/online/${userId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📨 Received online status:", data);
        } catch (error) {
          console.error("❌ Error parsing message:", error);
        }
      });

      console.log(`✅ Subscribed to /online/${userId}`);
    };

    client.onDisconnect = () => {
      console.warn(`🔌 STOMP disconnected for ${userId}`);
    };
    client.onStompError = (frame) => console.error("❌ STOMP Error:", frame);
    client.onWebSocketError = (error) => console.error("❌ WebSocket Error:", error);

    client.activate();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [userId]);

  return null; // không trả gì vì chỉ connect & log
}
