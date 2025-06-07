// src/lib/socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function createStompClient(token) {
  const socket = new SockJS("http://localhost/ws");
  console.log("token in socket:", token);
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
