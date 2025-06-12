// src/hooks/useChatMessages.js
import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/v1/messages/history/${chatId}?page=0&size=20`);
        setMessages(res.data.body); // tùy vào response
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  return { messages, loading };
}
