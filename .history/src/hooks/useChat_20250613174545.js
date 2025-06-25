"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import api, { isTokenValid } from "@/utils/axios";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";

export default function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const clientRef = useRef(null);
  const subscribedChatIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    }
  }, []);

  // Fetch old messages with proper ordering
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=100`);
      
      // Process messages with ownership and proper ordering
      const messagesWithOwnership = (res.data.body || [])
        .map(msg => ({
          ...msg,
          isOwnMessage: currentUserId && msg.sender?.id === currentUserId
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort by createdAt ascending
      
      setMessages(messagesWithOwnership);
    } catch (err) {
      console.error("❌ Error loading messages", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    if (clientRef.current?.connected && subscribedChatIdRef.current === chatId) {
      return;
    }

    const client = createStompClient();
    clientRef.current = client;

    const handleNewMessage = (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("📩 New message received:", data);

        // Handle DELETE command
        if (data.command === "DELETE") {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.id 
                ? { ...msg, content: "[Tin nhắn đã bị xóa]", deleted: true } 
                : msg
            )
          );
          return;
        }
        
        // Handle EDIT command
        if (data.command === "EDIT") {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.id
                ? { 
                    ...msg, 
                    content: data.message,
                    edited: true,
                    editedAt: data.editedAt || new Date().toISOString()
                  }
                : msg
            )
          );
          
          if (data.sender?.id !== currentUserId && data.sender?.username) {
            toast(`✏️ ${data.sender.username} đã chỉnh sửa tin nhắn`, {
              duration: 3000,
              position: "top-right",
            });
          }
          return;
        }

        // Handle new message
        const newMessage = {
          ...data,
          isOwnMessage: data.sender?.id === currentUserId,
          createdAt: data.createdAt || new Date().toISOString() // Ensure createdAt exists
        };

        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(msg => msg.id === newMessage.id)) return prev;
          
          // Add new message and sort by createdAt
          const updatedMessages = [...prev, newMessage].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
          
          return updatedMessages;
        });

        // Show toast for new messages from others
        if (data?.sender && data?.content && !newMessage.isOwnMessage) {
          toast(`💬 ${data.sender.username}: ${data.content}`, {
            duration: 4000,
            position: "top-right",
          });
        }
      } catch (err) {
        console.error("❌ Error parsing message:", err);
      }
    };

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);
      const subscription = client.subscribe(`/chat/${chatId}`, handleNewMessage);
      subscribedChatIdRef.current = chatId;
    };

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

    client.activate();

    // Connection health check
    intervalRef.current = setInterval(() => {
      if (!client.connected && isTokenValid()) {
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
  }, [chatId, currentUserId]);

  return { 
    messages, 
    loading,
    currentUserId,
    refreshMessages: fetchMessages // Add refresh capability
  };
}