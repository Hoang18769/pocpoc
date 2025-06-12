// src/utils/socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid, onTokenRefresh } from "./axios";

let globalStompClient = null;
let tokenRefreshUnsubscribe = null;

export function createStompClient(onConnect) {
  // Nếu đã có client và đang connected, trả về client hiện tại
  if (globalStompClient && globalStompClient.connected) {
    console.log("♻️ Reusing existing STOMP client");
    if (onConnect) onConnect();
    return globalStompClient;
  }

  // Deactivate client cũ nếu có
  if (globalStompClient) {
    try {
      globalStompClient.deactivate();
    } catch (error) {
      console.warn("Warning deactivating old client:", error);
    }
  }

  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost/ws"),
    connectHeaders: {
      Authorization: "Bearer " + (getAuthToken() || ""),
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);
      if (onConnect) onConnect(frame);
    },
    onDisconnect: (frame) => {
      console.warn("⚠️ STOMP disconnected", frame);
    },
    onWebSocketClose: (event) => {
      console.warn("⚠️ WebSocket closed", event);
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame);
      
      // Nếu lỗi do authentication, thử reconnect với token mới
      if (frame.headers && frame.headers.message && 
          frame.headers.message.includes('401')) {
        console.log("🔄 Authentication error, will reconnect with new token");
      }
    },
    beforeConnect: async () => {
      const token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Token expired or missing, waiting for refresh...");
        await new Promise((r) => setTimeout(r, 1000));
      }
      
      // Cập nhật token mới nhất
      const latestToken = getAuthToken();
      if (latestToken) {
        client.connectHeaders = {
          Authorization: "Bearer " + latestToken,
        };
        console.log("🔑 Updated STOMP auth header");
      }
    },
  });

  // ✅ Lắng nghe sự kiện token refresh
  if (tokenRefreshUnsubscribe) {
    tokenRefreshUnsubscribe();
  }
  
  tokenRefreshUnsubscribe = onTokenRefresh((newToken) => {
    console.log("🔄 Token refresh event received", newToken ? "✅" : "❌");
    
    if (newToken) {
      // Token mới có sẵn - cập nhật và reconnect
      client.connectHeaders = {
        Authorization: "Bearer " + newToken,
      };
      
      // Nếu client đang connected, disconnect và reconnect với token mới
      if (client.connected) {
        console.log("🔄 Reconnecting STOMP with new token...");
        client.deactivate();
        setTimeout(() => {
          client.activate();
        }, 1000);
      } else if (!client.active) {
        // Nếu client chưa active, activate với token mới
        console.log("🔄 Activating STOMP with new token...");
        client.activate();
      }
    } else {
      // Token bị xóa (logout) - disconnect client
      console.log("🚪 Logging out - deactivating STOMP client");
      if (client.connected || client.active) {
        client.deactivate();
      }
    }
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
      console.log("📤 Message sent to", destination);
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

    const subscription = client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error("❌ Error parsing message:", error);
        callback(message.body);
      }
    }, headers);
    
    console.log("📥 Subscribed to", destination);
    return subscription;
  };

  // Thêm method để manual reconnect
  client.reconnectWithNewToken = () => {
    const token = getAuthToken();
    if (!token) {
      console.warn("⚠️ No token available for reconnection");
      return;
    }
    
    client.connectHeaders = {
      Authorization: "Bearer " + token,
    };
    
    if (client.connected) {
      client.deactivate();
    }
    
    setTimeout(() => {
      console.log("🔄 Manual reconnect with token");
      client.activate();
    }, 1000);
  };

  globalStompClient = client;
  return client;
}

// Helper function để đợi client kết nối
export function waitForConnection(client, timeout = 10000) {
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

// Helper function để cleanup khi app shutdown
export function cleanupSocket() {
  if (tokenRefreshUnsubscribe) {
    tokenRefreshUnsubscribe();
    tokenRefreshUnsubscribe = null;
  }
  
  if (globalStompClient) {
    try {
      globalStompClient.deactivate();
    } catch (error) {
      console.warn("Warning cleaning up socket:", error);
    }
    globalStompClient = null;
  }
}

// Export client reference để có thể access từ bên ngoài
export function getGlobalStompClient() {
  return globalStompClient;
}