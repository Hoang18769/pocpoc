// src/lib/socket.js
import Sock
import { Client } from "@stomp/stompjs";

export function createStompClient(token) {
  const socket = new SockJS("http://localhost/ws");

  const client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: "Bearer " + token,
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
  });

  return client;
}
