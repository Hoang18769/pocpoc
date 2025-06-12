// hooks/useChat.js
"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/utils/axios";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";

export default function useChat(chatId, onMessage) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const clientRef = useRef(null);
  const subscribedRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch initial messages
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
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

  // WebSocket subscribe
  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      if (subscribedRef.current === chatId) return;

      client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          setMessages((prev) => [...prev, data]);

          if (onMessage) onMessage(data);

          if (data?.sender?.username && data?.content) {
            toast(`💬 ${data.sender.username}: ${data.content}`, {
              duration: 4000,
              position: "top-right",
            });
          }
        } catch (err) {
          console.error("❌ Error parsing message:", err);
        }
      });

      subscribedRef.current = chatId;
    };

    client.activate();

    intervalRef.current = setInterval(() => {
      if (!client.connected) {
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          subscribedRef.current = null;
          newClient.onConnect = client.onConnect;
          newClient.activate();
        });
      }
    }, 15000);

    return () => {
      client.deactivate();
      clearInterval(intervalRef.current);
      subscribedRef.current = null;
    };
  }, [chatId]);

  return { messages, loading };
}
