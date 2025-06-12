import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// 👉 nhận hàm getToken thay vì token tĩnh
export function createStompClient(getToken) {
  let socket = null;

  const client = new Client({
    // 🧠 Lấy token mới từ hàm mỗi lần kết nối lại
    webSocketFactory: () => {
      const token = getToken();
      socket = new SockJS(`http://localhost/ws?token=${token}`);
      return socket;
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
  });

  return client;
}
