import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function createStompClient(token) {
  const socket = new SockJS(`http://localhost/ws?token=${token}`); // gửi token qua URL

  const client = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
    // Không cần connectHeaders
  });

  return client;
}
