"use client";

import { useEffect, useState, useRef } from "react";
import api, { isTokenValid } from "@/utils/axios";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";

export default function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const clientRef = useRef(null);
  const subscribedChatIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch tin nhắn cũ
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

  // Socket - lắng nghe tin nhắn mới
  useEffect(() => {
    if (!chatId) return;

    if (clientRef.current && clientRef.current.connected && subscribedChatIdRef.current === chatId) {
      return; // Đã kết nối và subscribe rồi
    }

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);

      const subscription = client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📩 New message received:", data);

          if (data.command === "DELETE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.id ? { ...msg, content: "[Tin nhắn đã bị xóa]", deleted: true } : msg
              )
            );
            return;
          }

          setMessages((prev) => [...prev, data]);

          if (data?.sender && data?.content) {
            toast(`💬 ${data.sender.username}: ${data.content}`, {
              duration: 4000,
              position: "top-right",
            });
          }
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

    // Ping kiểm tra kết nối mỗi 15s
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
  }, [chatId]);

  return { messages, loading };
} 