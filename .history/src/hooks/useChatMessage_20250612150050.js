// src/hooks/useChatMessages.js
import api from "@/utils/axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";

export default function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

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
    setMessages((prev) => {
      // Kiểm tra duplicate message
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  // 🧭 Lắng nghe tin nhắn mới qua WebSocket
  useEffect(() => {
    if (!chatId) return;

    let mounted = true;

    const initializeWebSocket = async () => {
      try {
        // Cleanup existing connection trước khi tạo mới
        if (clientRef.current) {
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }
          clientRef.current.deactivate();
          clientRef.current = null;
        }

        console.log("🔌 Khởi tạo WebSocket connection cho chat:", chatId);

        // Tạo client mới với callback onConnect
        const client = createStompClient((frame) => {
          console.log("✅ WebSocket connected cho chat:", chatId);
          if (mounted) {
            setIsConnected(true);
          }
        });

        clientRef.current = client;

        // Activate connection
        client.activate();

        // Đợi connection được thiết lập
        await waitForConnection(client, 10000);

        if (!mounted) return; // Component đã unmount

        // Subscribe sau khi đã connect
        const onMessage = (msg) => {
          try {
            const body = JSON.parse(msg.body);
            console.log("📨 Nhận tin nhắn mới:", body);
            
            // Kiểm tra tin nhắn thuộc về chat hiện tại
            if (body.chatId === chatId && mounted) {
              addMessage(body);
            }
          } catch (err) {
            console.error("❌ Lỗi parse message:", err);
          }
        };

        const subscription = client.subscribe(`/topic/chat/${chatId}`, onMessage);
        subscriptionRef.current = subscription;

        console.log("📡 Đã subscribe vào channel:", `/topic/chat/${chatId}`);

      } catch (error) {
        console.error("❌ Lỗi khởi tạo WebSocket:", error);
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    initializeWebSocket();

    // Cleanup function
    return () => {
      console.log("🧹 Cleanup WebSocket cho chat:", chatId);
      mounted = false;
      setIsConnected(false);

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (error) {
          console.warn("⚠️ Lỗi khi unsubscribe:", error);
        }
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (error) {
          console.warn("⚠️ Lỗi khi deactivate client:", error);
        }
        clientRef.current = null;
      }
    };
  }, [chatId, addMessage]);

  // 📤 Hàm gửi tin nhắn
  const sendMessage = useCallback((messageContent, messageType = 'TEXT') => {
    const client = clientRef.current;
    
    if (!client || !client.connected) {
      console.error("❌ Không thể gửi tin nhắn: WebSocket chưa kết nối");
      return false;
    }

    try {
      const message = {
        chatId,
        content: messageContent,
        type: messageType,
        timestamp: new Date().toISOString(),
      };

      // Gửi tin nhắn qua WebSocket
      const success = client.sendMessage(`/app/chat/send`, message);
      
      if (success) {
        console.log("📤 Đã gửi tin nhắn:", message);
      }
      
      return success;
    } catch (error) {
      console.error("❌ Lỗi gửi tin nhắn:", error);
      return false;
    }
  }, [chatId]);

  return { 
    messages, 
    loading, 
    isConnected,
    sendMessage,
    addMessage // Export để có thể thêm message từ bên ngoài nếu cần
  };
}