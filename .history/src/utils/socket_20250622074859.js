import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid, onTokenRefresh, refreshToken } from "./axios";

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
      // Buộc refresh token nếu không có hoặc hết hạn
      let token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Force refreshing token...");
        token = await forceGetValidToken();
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
      const token = await forceGetValidToken();
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

// Buộc lấy token hợp lệ - sẽ gọi API refresh nếu cần
async function forceGetValidToken(maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const token = getAuthToken();
      
      // Nếu có token và còn hạn thì return
      if (token && isTokenValid()) {
        console.log("✅ Token is valid");
        return token;
      }
      
      // Nếu không có token hoặc hết hạn, buộc refresh
      console.log(`🔄 Attempting to refresh token (attempt ${retries + 1}/${maxRetries})`);
      
      // Gọi API refresh token (giả sử bạn có hàm này trong axios.js)
      const newToken = await refreshToken();
      
      if (newToken && isTokenValid()) {
        console.log("✅ Token refreshed successfully");
        return newToken;
      }
      
      throw new Error("Failed to get valid token after refresh");
      
    } catch (error) {
      retries++;
      console.error(`❌ Token refresh attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error("❌ Max retries reached. Redirecting to login...");
        // Redirect to login page
        window.location.href = '/login';
        throw new Error("Unable to get valid token after multiple attempts");
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
}

// Alternative: Nếu bạn muốn dùng event-based approach nhưng với fallback
function waitForValidTokenWithFallback(timeout = 5000) {
  return new Promise(async (resolve, reject) => {
    const token = getAuthToken();
    if (token && isTokenValid()) {
      return resolve(token);
    }

    // Set timeout ngắn hơn
    const timeoutId = setTimeout(async () => {
      unsubscribe();
      console.log("⏰ Timeout waiting for token event, forcing refresh...");
      
      try {
        // Fallback: buộc refresh token
        const newToken = await forceGetValidToken();
        resolve(newToken);
      } catch (error) {
        reject(error);
      }
    }, timeout);

    const unsubscribe = onTokenRefresh((newToken) => {
      if (newToken && isTokenValid()) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(newToken);
      }
    });
  });
}