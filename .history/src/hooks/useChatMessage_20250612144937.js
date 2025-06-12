// src/hooks/useChatMessages.js
import api from "@/utils/axios";
import { useEffect, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Load lịch sử tin nhắn ban đầu
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

  // ➕ Hàm thêm tin nhắn vào danh sách
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // 🧭 Lắng nghe tin nhắn mới qua WebSocket
  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();

    const onMessage = (msg) => {
      try {
        const body = JSON.parse(msg.body);
        if (body.chatId === chatId) {
          addMessage(body);
        }
      } catch (err) {
        console.error("❌ Lỗi parse message:", err);
      }
    };

    const subscription = client.subscribeToChannel(`/chat/${chatId}`, onMessage);

    return () => {
      subscription?.unsubscribe?.(); // cleanup khi chatId thay đổi hoặc component unmount
    };
  }, [chatId, addMessage]);

  return { messages, loading };
}
