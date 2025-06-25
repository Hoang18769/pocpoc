"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import api, { isTokenValid } from "@/utils/axios";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";

export default function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const clientRef = useRef(null);
  const subscribedChatIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Lấy userId từ localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    }
  }, []);

  // Fetch tin nhắn cũ
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=100`);
      
      const messagesWithOwnership = (res.data.body || []).map(msg => ({
        ...msg,
        isOwnMessage: currentUserId && msg.sender?.id === currentUserId
      }));
      
      setMessages(messagesWithOwnership);
    } catch (err) {
      console.error("❌ Lỗi khi tải tin nhắn", err);
      toast.error("Không thể tải tin nhắn");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Xử lý tin nhắn mới
  const handleNewMessage = useCallback((data) => {
    // Xử lý lệnh DELETE
    if (data.command === "DELETE") {
      setMessages(prev => prev.map(msg => 
        msg.id === data.id ? { ...msg, content: "[Tin nhắn đã bị xóa]", deleted: true } : msg
      ));
      return;
    }

    // Xử lý lệnh EDIT
    if (data.command === "EDIT") {
      setMessages(prev => prev.map(msg =>
        msg.id === data.id ? { 
          ...msg, 
          content: data.message,
          edited: true,
          editedAt: data.editedAt || new Date().toISOString()
        } : msg
      ));

      const isOwnEdit = data.sender?.id === currentUserId;
      if (!isOwnEdit && data.sender?.username) {
        toast(`✏️ ${data.sender.username} đã chỉnh sửa tin nhắn`, {
          duration: 3000,
          position: "top-right",
        });
      }
      return;
    }

    // Tin nhắn mới thông thường
    const newMessage = {
      ...data,
      isOwnMessage: data.sender?.id === currentUserId
    };

    setMessages(prev => {
    const updated = [...prev, newMessage];
    return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

    if (data?.sender && data?.content && !newMessage.isOwnMessage) {
      toast(`💬 ${data.sender.username}: ${data.content}`, {
        duration: 4000,
        position: "top-right",
      });
    }
  }, [currentUserId]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    // Nếu đã kết nối đến chat này rồi thì không kết nối lại
    if (clientRef.current?.connected && subscribedChatIdRef.current === chatId) {
      return;
    }

    const client = createStompClient();
    clientRef.current = client;

    const setupSubscription = () => {
      const subscription = client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📩 New message:", data);
          handleNewMessage(data);
        } catch (err) {
          console.error("❌ Lỗi phân tích tin nhắn:", err);
        }
      });

      subscribedChatIdRef.current = chatId;
      return subscription;
    };

    client.onConnect = () => {
      console.log(`🔌 Đã kết nối WebSocket [chat:${chatId}]`);
      setConnectionStatus("connected");
      setupSubscription();
    };

    client.onDisconnect = () => {
      console.warn(`🔌 Mất kết nối WebSocket [chat:${chatId}]`);
      setConnectionStatus("disconnected");
      subscribedChatIdRef.current = null;
    };

    client.onStompError = (frame) => {
      console.error("❌ Lỗi STOMP:", frame);``
      setConnectionStatus("error");
    };

    client.onWebSocketError = (err) => {
      console.error("❌ Lỗi WebSocket:", err);
      setConnectionStatus("error");
    };

    client.activate();

    // Kiểm tra kết nối định kỳ
    intervalRef.current = setInterval(() => {
      if (!client.connected && isTokenValid()) {
        console.log("🔁 Đang thử kết nối lại...");
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          newClient.onConnect = client.onConnect;
          newClient.activate();
        });
      }
    }, 15000);

    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
      }
      clearInterval(intervalRef.current);
      subscribedChatIdRef.current = null;
      console.log(`🧹 Đã dọn dẹp WebSocket [chat:${chatId}]`);
    };
  }, [chatId, currentUserId, handleNewMessage]);

  return { 
    messages, 
    loading,
    currentUserId,
    connectionStatus,
    refetchMessages: fetchMessages
  };
}