import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid } from "./axios";

let client = null;
const subscriptions = [];

// ⚙️ Tạo Stomp Client (singleton)
export function createStompClient() {
  if (client) return client; // 🔁 Tránh tạo lại client nhiều lần

  client = new Client({
    webSocketFactory: () => new SockJS("http://localhost/ws"),
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000, // ✅ Tự reconnect khi mất kết nối

    beforeConnect: async () => {
      let token = getAuthToken();
      while (!token || !isTokenValid()) {
        console.log("⏳ Waiting for valid token...");
        await new Promise((r) => setTimeout(r, 300));
        token = getAuthToken();
      }
      client.connectHeaders = {
        Authorization: "Bearer " + token,
      };
    },

    onConnect: (frame) => {
      console.log("✅ STOMP connected");
      subscriptions.forEach(({ destination, callback, headers }) => {
        client.subscribe(destination, callback, headers);
      });
    },

    onDisconnect: () => console.warn("⚠️ STOMP disconnected"),
    onWebSocketClose: () => console.warn("⚠️ WebSocket closed"),
    onWebSocketError: (event) => console.error("❌ WebSocket error:", event),
  });

  // 🚀 Gửi tin nhắn
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
          'content-type': 'application/json',
          ...headers,
        },
      });
      return true;
    } catch (err) {
      console.error("❌ Error sending message:", err);
      return false;
    }
  };

  // 🧭 Subscribe đến 1 kênh
  client.subscribeToChannel = (destination, callback, headers = {}) => {
    subscriptions.push({ destination, callback, headers });

    if (client.connected) {
      return client.subscribe(destination, callback, headers);
    }
    return null;
  };

  return client;
}

// 🕒 Đợi client kết nối thành công
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
