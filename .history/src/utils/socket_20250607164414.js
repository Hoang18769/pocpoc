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

  client.onConnect = () => {
    console.log("✅ STOMP connected");
  };

  client.onStompError = (frame) => {
    console.error("⚠️ Broker error: ", frame.headers["message"]);
  };

  client.onDisconnect = () => {
    console.log("❌ STOMP disconnected");
  };

  return client;
}
