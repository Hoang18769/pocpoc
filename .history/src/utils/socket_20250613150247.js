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
    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);
      // Đảm bảo client đã connected trước khi gọi callback
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
      client.connectHeaders = {
        Authorization: "Bearer " + (getAuthToken() || ""),
      };
    },
  });

  // Thêm phương thức helper để gửi tin nhắn
  client.sendMessage = (destination, message, headers = {}) => {
    if (!client.connected) {
      console.error("❌ Client not connected. Cannot send message.");
      return false;
    }
    
    try {
      client.publish({
        destination: destination,
        body: JSON.stringify(message),
        headers: {
          'content-type': 'application/json',
          ...headers
        }
      });
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  };

  // Thêm phương thức helper để subscribe
  client.subscribeToChannel = (destination, callback, headers = {}) => {
    if (!client.connected) {
      console.error("❌ Client not connected. Cannot subscribe.");
      return null;
    }

    return client.subscribe(destination, callback, headers);
  };

  return client;
}

// Helper function để đợi client kết nối
export function waitForConnection(client, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (client.connected) {
      resolve(client);
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Connection timeout"));
    }, timeout);

    const originalOnConnect = client.onConnect;
    client.onConnect = (frame) => {
      clearTimeout(timeoutId);
      if (originalOnConnect) originalOnConnect(frame);
      resolve(client);
    };
  });
}