export function createStompClient(getToken) {
  const socket = new SockJS("http://localhost/ws");

  const client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: () => ({
      Authorization: "Bearer " + getToken(),
    }),
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
  });

  return client;
}
