import { useEffect, useRef, useState, useCallback } from "react";
import api from "@/utils/axios";
import { createStompClient, waitForConnection } from "@/utils/socket";

export default function useChat(chatId, receiverUsername) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (text) => {
      if (!clientRef.current || !isConnected) {
        throw new Error("Socket chưa kết nối");
      }
      const payload = {
        chatId,
        content: text,
        receiverUsername,
      };
      clientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify(payload),
      });
    },
    [chatId, receiverUsername, isConnected]
  );

  // Load lịch sử tin nhắn
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=20`);
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

  // Kết nối WebSocket và lắng nghe tin nhắn mới
  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      setIsConnected(true);
      console.log(`🟢 Connected to chat:${chatId}`);
      client.subscribe(`/chat/${chatId}`, (msg) => {
        try {
          const data = JSON.parse(msg.body);
          if (data.chatId === chatId) {
            setMessages((prev) => [...prev, data]);
          }
        } catch (err) {
          console.error("❌ Lỗi parse message:", err);
        }
      });
    };

    client.onDisconnect = () => {
      console.warn("🔌 Disconnected from chat");
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error:", frame);
    };

    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [chatId]);

  return {
    messages,
    loading,
    isConnected,
    sendMessage,
  };
}
