// src/utils/socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid } from "./axios";

export function createStompClient(onConnect) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"), // sửa lại port nếu cần
    connectHeaders: {
      Authorization: "Bearer " + (getAuthToken() || ""),
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,

    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);

      // Xử lý các subscribe chờ nếu có
      if (client._pendingSubscriptions && client._pendingSubscriptions.length > 0) {
        client._pendingSubscriptions.forEach(({ destination, callback, headers }) => {
          console.log("📡 Subscribing to:", destination);
          client.subscribe(destination, callback, headers);
        });
        client._pendingSubscriptions = [];
      }

      if (onConnect) onConnect(frame);
    },

    onDisconnect: () => {
      console.warn("⚠️ STOMP disconnected");
      client._pendingSubscriptions = [];
    },

    onWebSocketClose: (e) => console.warn("⚠️ WebSocket closed", e),
    onWebSocketError: (event) => console.error("❌ WebSocket error:", event),
    onStompError: (frame) => console.error("❌ STOMP error:", frame),

    beforeConnect: async () => {
      const token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Token expired or missing, waiting...");
        await new Promise((r) => setTimeout(r, 500));
      }
      client.connectHeaders = {
        Authorization: "Bearer " + (getAuthToken() || ""),
      };
    },
  });

  // Khởi tạo hàng đợi subscribe chờ
  client._pendingSubscriptions = [];

  // Gửi tin nhắn
  client.sendMessage = (destination, message, headers = {}) => {
    if (!client.connected) {
      console.error("❌ Client not connected. Cannot send message.");
      return false;
    }

    try {
      client.publish({
        destination,
        body: JSON.stringify(message),
        headers: {
          "content-type": "application/json",
          ...headers,
        },
      });
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  };

  // Subscribe có hàng đợi nếu chưa kết nối
  client.subscribeToChannel = (destination, callback, headers = {}) => {
    if (!client.connected) {
      console.log("⏳ Not connected yet. Queuing subscription:", destination);
      client._pendingSubscriptions.push({ destination, callback, headers });
      return null;
    }

    return client.subscribe(destination, callback, headers);
  };

  // Kết nối nếu chưa kết nối
  client.ensureConnection = async (timeout = 5000) => {
    if (client.connected) return client;
    if (!client.active) client.activate();
    return waitForConnection(client, timeout);
  };

  return client;
}

// Đợi client kết nối
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

    if (!client.active) {
      client.activate();
    }
  });
}
