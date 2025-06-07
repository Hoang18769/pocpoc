import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function createStompClient(token) {
  // Đưa token vào query param
  const socket = new SockJS(`http://localhost/ws?token=${token}`);

  const client = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
    // ⚠️ connectHeaders thường không có tác dụng khi dùng SockJS
  });

  return client;
}
