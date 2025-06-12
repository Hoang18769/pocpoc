// src/lib/socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "../utils/axios"; // custom axios instance với interceptor

// Hàm lấy access token mới nhất
const getAccessToken = () => localStorage.getItem("accessToken");

// Hàm tự refresh token nếu hết hạn
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const res = await axios.post("/auth/refresh", { refreshToken });
    const { accessToken } = res.data;
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (err) {
    console.error("❌ Refresh token failed:", err);
    throw err;
  }
};

export function createStompClient() {
  const socket = new SockJS("http://localhost/ws");

  const client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: () => ({
      Authorization: "Bearer " + getAccessToken(),
    }),
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
  });

  // Nếu server trả lỗi do token, tự động refresh rồi reconnect
  client.onStompError = async (frame) => {
    const msg = frame.headers["message"] || "";
    console.error("❌ STOMP error:", msg);

    if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
      try {
        const newToken = await refreshAccessToken();
        client.connectHeaders = {
          Authorization: "Bearer " + newToken,
        };
        client.deactivate();
        client.activate();
        console.log("🔄 Token refreshed & reconnected WebSocket");
      } catch (err) {
        console.error("❌ Failed to reconnect WebSocket after token refresh");
      }
    }
  };

  return client;
}
