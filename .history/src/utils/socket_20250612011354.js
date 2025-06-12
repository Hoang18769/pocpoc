// src/utils/socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid } from "./axios";

export function createStompClient(onConnect) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost/ws"),
    connectHeaders: {
      Authorization: "Bearer " + (getAuthToken() || ""),
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
    onConnect: onConnect || (() => console.log("✅ STOMP connected")),
    onDisconnect: () => console.warn("⚠️ STOMP disconnected"),
    onWebSocketClose: () => console.warn("⚠️ WebSocket closed"),
    onWebSocketError: (event) => console.error("❌ WebSocket error:", event),
    beforeConnect: async () => {
      const token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Token expired or missing, waiting for refresh...");
        await new Promise((r) => setTimeout(r, 500));
      }
      client.connectHeaders = {
        Authorization: "Bearer " + (getAuthToken() || ""),
      };
    },
  });

  client.activate(); // ✅ Quan trọng: kích hoạt client

  return client;
}
