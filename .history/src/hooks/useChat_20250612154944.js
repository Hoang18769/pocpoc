"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/utils/axios";
import { createStompClient, waitForConnection } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clientRef = useRef(null);
  const intervalRef = useRef(null);

  // Tải tin nhắn ban đầu
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=20`);
        setMessages(res.data.body || []);
        setError(null);
      } catch (err) {
        console.error("❌ Lỗi khi tải tin nhắn:", err);
        setMessages([]);
        setError("Không thể tải tin nhắn");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  // Kết nối WebSocket và lắng nghe
  useEffect(() => {
    if (!chatId) return;

    const client = createStompClient();
    clientRef.current = client;

    const handleMessage = (message) => {
      try {
        const data = JSON.parse(message.body);
        if (data.chatId === chatId) {
          setMessages((prev) => [...prev, data]);

          // Hiển thị toast
          if (data?.sender?.username && data?.content) {
            toast(`💬 ${data.sender.username}: ${data.content}`, {
              duration: 4000,
              position: "top-right",
            });
          }
        }
      } catch (err) {
        console.error("❌ Lỗi parse message:", err);
      }
    };

    client.onConnect = async () => {
      console.log(`✅ Connected to WebSocket [chat:${chatId}]`);
      client.subscribe(`/chat/${chatId}`, handleMessage);
    };

    client.onDisconnect = () => {
      console.warn(`🔌 Disconnected [chat:${chatId}]`);
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error:", frame);
    };

    client.onWebSocketError = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    client.activate();

    // Kiểm tra kết nối định kỳ
    intervalRef.current = setInterval(() => {
      if (!client.connected) {
        console.log(`🔄 WebSocket mất kết nối, thử reconnect...`);

        const token = getAuthToken();
        if (token && isTokenValid()) {
          client.deactivate().then(() => {
            const newClient = createStompClient();
            clientRef.current = newClient;
            newClient.onConnect = client.onConnect;
            newClient.activate();
          });
        } else {
          console.warn("⛔ Token không hợp lệ, không reconnect.");
        }
      }
    }, 15000);

    return () => {
      client.deactivate();
      clearInterval(intervalRef.current);
      console.log(`❌ Cleaned up WebSocket [chat:${chatId}]`);
    };
  }, [chatId]);

  return {
    messages,
    loading,
    error,
  };
}
