import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid, onTokenRefresh } from "./axios";
import api from "./axios";

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
      // Sử dụng approach kết hợp event + force refresh
      let token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Getting valid token...");
        token = await waitForValidTokenWithFallback();
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
      const token = await waitForValidTokenWithFallback();
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

// Buộc lấy token hợp lệ - sử dụng axios interceptor để refresh
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
      
      // Nếu không có token hoặc hết hạn, buộc refresh bằng cách gọi API protected
      console.log(`🔄 Triggering token refresh (attempt ${retries + 1}/${maxRetries})`);
      
      // Gọi một API protected để trigger refresh token trong axios interceptor
      try {
        await api.get('/v1/auth/validate'); // hoặc endpoint nào đó yêu cầu auth
      } catch (error) {
        // Nếu lỗi 401, axios interceptor sẽ tự động refresh token
        if (error.response?.status === 401) {
          console.log("🔄 Token refresh triggered by 401 response");
        }
      }
      
      // Kiểm tra lại token sau khi axios interceptor xử lý
      const newToken = getAuthToken();
      if (newToken && isTokenValid()) {
        console.log("✅ Token refreshed successfully");
        return newToken;
      }
      
      throw new Error("Failed to get valid token after refresh attempt");
      
    } catch (error) {
      retries++;
      console.error(`❌ Token refresh attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error("❌ Max retries reached. Session may be expired.");
        throw new Error("Unable to get valid token after multiple attempts");
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
}

// Alternative: Sử dụng Promise.race để kết hợp event-based và polling
function waitForValidTokenWithFallback(timeout = 3000) {
  return Promise.race([
    // Approach 1: Chờ event từ axios interceptor
    new Promise((resolve, reject) => {
      const token = getAuthToken();
      if (token && isTokenValid()) {
        return resolve(token);
      }

      const unsubscribe = onTokenRefresh((newToken) => {
        if (newToken && isTokenValid()) {
          unsubscribe();
          resolve(newToken);
        }
      });

      // Cleanup nếu không có token event trong thời gian timeout
      setTimeout(() => {
        unsubscribe();
        reject(new Error("Token event timeout"));
      }, timeout);
    }),
    
    // Approach 2: Force refresh ngay lập tức
    (async () => {
      // Đợi một chút để event có cơ hội xảy ra trước
      await new Promise(resolve => setTimeout(resolve, 100));
      return forceGetValidToken();
    })()
  ]);
}