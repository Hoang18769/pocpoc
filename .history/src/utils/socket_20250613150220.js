// src/utils/socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid } from "./axios";

let stompClient = null;

export function createStompClient(onConnect) {
  if (stompClient) return stompClient; // ✅ Singleton return

  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost/ws"),
    connectHeaders: {
      Authorization: "Bearer " + (getAuthToken() || ""),
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);
      if (onConnect) onConnect(frame);
    },
    onDisconnect: () => console.warn("⚠️ STOMP disconnected"),
    onWebSocketClose: () => console.warn("⚠️ WebSocket closed"),
    onWebSocketError: (event) => console.error("❌ WebSocket error:", event),
    beforeConnect: async () => {
      const token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Token expired or missing, waiting for refresh...");
        await new Promise((r) => setTimeout(r, 500));
      }
      stompClient.connectHeaders = {
        Authorization: "Bearer " + (getAuthToken() || ""),
      };
    },
  });

  stompClient.sendMessage = (destination, message, headers = {}) => {
    if (!stompClient.connected) {
      console.error("❌ Client not connected. Cannot send message.");
      return false;
    }
    try {
      stompClient.publish({
        destination,
        body: JSON.stringify(message),
        headers: {
          'content-type': 'application/json',
          ...headers,
        },
      });
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  };

  stompClient.subscribeToChannel = (destination, callback, headers = {}) => {
    if (!stompClient.connected) {
      console.error("❌ Client not connected. Cannot subscribe.");
      return null;
    }
    return stompClient.subscribe(destination, callback, headers);
  };

  return stompClient;
}
