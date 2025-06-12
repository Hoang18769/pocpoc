// src/hooks/useChatMessages.js
import api from "@/utils/axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null); // lưu STOMP client

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

  // ➕ Thêm tin nhắn mới
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // 🧭 Kết nối WebSocket và lắng nghe tin nhắn mới
  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();
    clientRef.current = client;

    let subscription = null;

    client.ensureConnection().then(() => {
      subscription = client.subscribeToChannel(`/chat/${chatId}`, (msg) => {
        try {
          const body = JSON.parse(msg.body);
          if (body.chatId === chatId) {
            addMessage(body);
          }
        } catch (err) {
          console.error("❌ Lỗi parse message:", err);
        }
      });
    }).catch((err) => {
      console.error("❌ Không thể kết nối WebSocket:", err);
    });

    return () => {
      // Ngắt kết nối và unsubscribe khi unmount hoặc chatId đổi
      if (subscription?.unsubscribe) subscription.unsubscribe();
      client.deactivate(); // ngắt kết nối WebSocket
    };
  }, [chatId, addMessage]);

  return { messages, loading };
}
