// src/hooks/useChatMessages.js
import api from "@/utils/axios";
import { useEffect, useState, useCallback } from "react";

export default function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=20`);
        setMessages(res.data.body || []);
        console.log(res);
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  // 👇 Hàm để thêm tin nhắn mới vào cuối danh sách
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return { messages, loading, addMessage };
}
