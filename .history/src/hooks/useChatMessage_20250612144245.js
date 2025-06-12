// src/hooks/useChatMessages.js
import api from "@/utils/axios";
import { useEffect, useState, useCallback } from "react";

export default function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Load lịch sử tin nhắn ban đầu
  const fetchMessages = useCallback(async (page = 0, size = 20) => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get(`/v1/chat/messages/${chatId}?page=${page}&size=${size}`);
      const newMessages = res.data.body || [];
      
      if (page === 0) {
        // Trang đầu tiên - thay thế toàn bộ
        setMessages(newMessages);
      } else {
        // Các trang tiếp theo - thêm vào đầu (tin nhắn cũ hơn)
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      console.log(`✅ Đã tải ${newMessages.length} tin nhắn cho chat:${chatId}`);
      return newMessages;
    } catch (err) {
      console.error("❌ Lỗi khi tải tin nhắn:", err);
      setError(err);
      if (page === 0) {
        setMessages([]);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Load tin nhắn ban đầu khi chatId thay đổi
  useEffect(() => {
    fetchMessages(0, 20);
  }, [fetchMessages]);

  // ➕ Hàm thêm tin nhắn mới vào cuối danh sách
  const addMessage = useCallback((message) => {
    if (!message) return;
    
    setMessages((prev) => {
      // Kiểm tra duplicate (dựa trên id hoặc timestamp)
      const isDuplicate = prev.some(msg => 
        (msg.id && msg.id === message.id) || 
        (msg.timestamp && msg.timestamp === message.timestamp && msg.content === message.content)
      );
      
      if (isDuplicate) {
        console.log("⚠️ Tin nhắn trùng lặp, bỏ qua");
        return prev;
      }
      
      console.log("➕ Thêm tin nhắn mới:", message);
      return [...prev, message];
    });
  }, []);

  // 🔄 Hàm cập nhật tin nhắn (cho trường hợp edit, status update, etc.)
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  // ❌ Hàm xóa tin nhắn
  const removeMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter(msg => msg.id !== messageId));
  }, []);

  // 🔄 Hàm tải thêm tin nhắn cũ (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (loading) return;
    
    const currentPage = Math.floor(messages.length / 20);
    const newMessages = await fetchMessages(currentPage, 20);
    return newMessages.length > 0; // Return true nếu còn tin nhắn để tải
  }, [fetchMessages, loading, messages.length]);

  // 🧹 Hàm clear tin nhắn (khi switch chat)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // 📊 Thống kê tin nhắn
  const messageStats = {
    total: messages.length,
    hasMore: messages.length > 0 && messages.length % 20 === 0, // Estimate có còn tin nhắn không
    lastMessageTime: messages.length > 0 ? messages[messages.length - 1]?.timestamp : null
  };

  return {
    // Data
    messages,
    loading,
    error,
    messageStats,
    
    // Actions
    addMessage,
    updateMessage,
    removeMessage,
    loadMoreMessages,
    clearMessages,
    refetch: () => fetchMessages(0, 20)
  };
}