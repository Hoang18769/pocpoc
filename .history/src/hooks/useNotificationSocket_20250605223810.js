import { useNotifications } from "@/context/NotificationContext";
import toast from "react-hot-toast";

// ...

export default function useNotificationSocket(userId, token) {
  const clientRef = useRef(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!userId || !token) return;

    const client = createStompClient(token);
    clientRef.current = client;

    client.onConnect = () => {
      console.log("🔌 Connected to WebSocket");

      client.subscribe(`/notifications/${userId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("🔔 Notification received:", data);

          // 🧠 Lưu vào context
          addNotification(data);

          // 🔔 Hiển thị toast
          toast(`${data.creator?.givenName || "Ai đó"} vừa có hành động: ${data.action}`);
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", err);
        }
      });
    };

    client.activate();

    return () => {
      client.deactivate();
      console.log("❌ Disconnected from WebSocket");
    };
  }, [userId, token, addNotification]);
}
