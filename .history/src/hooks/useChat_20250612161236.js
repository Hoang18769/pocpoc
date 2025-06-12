import api from "@/utils/axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { createStompClient } from "@/utils/socket";
import { isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function useChat(chatId, onMessage) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);
  const subscribedChatIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Gọi API để lấy tin nhắn ban đầu
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=100`);
        setMessages(res.data.body || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải tin nhắn", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  // Hàm xử lý khi nhận tin nhắn mới
  const handleIncomingMessage = useCallback(
    (data) => {
      setMessages((prev) => [...prev, data]);

      if (onMessage) {
        onMessage(data); // gọi callback custom từ bên ngoài
      }

      // Optional: hiển thị thông báo
      if (data?.sender && data?.content) {
        toast(`💬 ${data.sender.username}: ${data.content}`, {
          duration: 4000,
          position: "top-right",
        });
      }
    },
    [onMessage]
  );

  // Kết nối WebSocket và subscribe
  useEffect(() => {
    if (!chatId) return;

    if (
      clientRef.current &&
      clientRef.current.connected &&
      subscribedChatIdRef.current === chatId
    ) {
      return;
    }

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);

      client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          handleIncomingMessage(data);
        } catch (err) {
          console.error("❌ Error parsing message:", err);
        }
      });

      subscribedChatIdRef.current = chatId;

      client.onDisconnect = () => {
        console.warn(`🔌 Disconnected from WebSocket [chat:${chatId}]`);
        subscribedChatIdRef.current = null;
      };

      client.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame);
      };

      client.onWebSocketError = (err) => {
        console.error("❌ WebSocket error:", err);
      };
    };

    client.activate();

    // Kiểm tra kết nối mỗi 15s
    intervalRef.current = setInterval(() => {
      const connected = client.connected;
      console.log(`[chat:${chatId}] Status: ${connected ? "✅ connected" : "❌ disconnected"}`);

      if (!connected && isTokenValid()) {
        console.log("🔁 Attempting to reconnect...");
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          subscribedChatIdRef.current = null;
          newClient.onConnect = client.onConnect;
          newClient.activate();
        });
      }
    }, 15000);

    return () => {
      client.deactivate();
      clearInterval(intervalRef.current);
      subscribedChatIdRef.current = null;
      console.log(`❌ Cleaned up WebSocket [chat:${chatId}]`);
    };
  }, [chatId, handleIncomingMessage]);

  return { messages, loading };
}
