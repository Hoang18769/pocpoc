import api from "@/utils/axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";

export default function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const stompRef = useRef(null); // giữ tham chiếu client để cleanup sau

  // Tải lịch sử tin nhắn
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

  // Lắng nghe tin nhắn mới qua WebSocket
  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();
    stompRef.current = client;

    const onMessage = (msg) => {
      try {
        const data = JSON.parse(msg.body);
        if (data.chatId === chatId) {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("❌ Lỗi parse message:", err);
      }
    };

    const setupConnection = async () => {
      try {
        client.activate();
        await waitForConnection(client);
        client.subscribeToChannel(`/chat/${chatId}`, onMessage);
      } catch (err) {
        console.error("❌ Không thể kết nối WebSocket:", err);
      }
    };

    setupConnection();

    return () => {
      try {
        stompRef.current?.deactivate();
        stompRef.current = null;
      } catch (e) {
        console.warn("⚠️ Lỗi khi ngắt kết nối STOMP:", e);
      }
    };
  }, [chatId]);

  return { messages, loading };
}
