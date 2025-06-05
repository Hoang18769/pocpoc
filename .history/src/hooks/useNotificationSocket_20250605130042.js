// src/hooks/useNotificationSocket.js
"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useNotificationSocket(userName, token) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userName || !token) return;

    const client = createStompClient(token);
    clientRef.current = client;

    client.onConnect = () => {
      console.log("🔌 Connected to WebSocket");

      client.subscribe(`/notifications/${userId}`, (message) => {
        console.log("🔔 Notification received:", message.body);
        // TODO: handle message here (ex: push to toast, state...)
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error", frame);
    };

    client.activate();

    return () => {
      client.deactivate();
      console.log("❌ Disconnected from WebSocket");
    };
  }, [userName, token]);
}
