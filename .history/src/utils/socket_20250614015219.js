import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid, onTokenRefresh } from "./axios";

export function createStompClient(onConnect) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost/ws"),
    connectHeaders: {
      Authorization: "Bearer " + (getAuthToken() || ""),
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000, // auto reconnect
    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);
      if (onConnect) onConnect(frame);
    },
    onDisconnect: () => console.warn("⚠️ STOMP disconnected"),
    onWebSocketClose: () => console.warn("⚠️ WebSocket closed"),
    onWebSocketError: (event) => console.error("❌ WebSocket error:", event),
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"] || frame.body);
      // Nếu bị lỗi 403 hoặc lỗi xác thực, thử refresh token và reconnect
      if (frame.headers["message"]?.includes("403") || frame.body?.includes("403")) {
        console.log("🔄 Token invalid. Will try to refresh and reconnect...");
        reconnectWithNewToken();
      }
    },
    beforeConnect: async () => {
      // Đợi token mới nếu token hiện tại hết hạn
      let token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Waiting for token refresh...");
        token = await waitForValidToken();
      }
      client.connectHeaders = {
        Authorization: "Bearer " + (token || ""),
      };
    },
  });

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

  // Subscribe channel
  client.subscribeToChannel = (destination, callback, headers = {}) => {
    if (!client.connected) {
      console.error("❌ Client not connected. Cannot subscribe.");
      return null;
    }
    return client.subscribe(destination, callback, headers);
  };

  // Reconnect with refreshed token
  async function reconnectWithNewToken() {
    try {
      const token = await waitForValidToken();
      client.connectHeaders = {
        Authorization: "Bearer " + token,
      };
      client.deactivate().then(() => {
        client.activate(); // reconnect
      });
    } catch (err) {
      console.error("❌ Failed to refresh token and reconnect:", err);
    }
  }

  return client;
}

// Đợi token hợp lệ thông qua event listener
function waitForValidToken(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const token = getAuthToken();
    if (token && isTokenValid()) {
      return resolve(token);
    }

    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error("Timeout waiting for valid token"));
    }, timeout);

    const unsubscribe = onTokenRefresh((newToken) => {
      if (newToken && isTokenValid()) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(newToken);
      }
    });
  });
}export { waitForConnection };

