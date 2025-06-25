"use client";

import { useEffect, useState, useRef } from "react";
import api, { isTokenValid } from "@/utils/axios";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const clientRef = useRef(null);
  const subscribedChatIdRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setCurrentUserId(storedUserId);
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!chatId) return;
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=100`);
        setMessages(res.data.body);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [chatId, currentUserId]);

  // Listen to socket
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    if (
      clientRef.current &&
      clientRef.current.connected &&
      subscribedChatIdRef.current === chatId
    ) {
      return;
    }

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);
      client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📩 New message received:", data);

          // DELETE
          if (data.command === "DELETE") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.id ? { ...m, content: "[Tin nhắn đã bị xóa]", deleted: true } : m
              )
            );
            return;
          }

          // EDIT
          if (data.command === "EDIT") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.id
                  ? { ...m, content: data.message, edited: true, editedAt: data.editedAt || new Date().toISOString() }
                  : m
              )
            );

            if (data.sender?.id !== currentUserId && data.sender?.username) {
              toast(`✏️ ${data.sender.username} đã chỉnh sửa tin nhắn`);
            }
            return;
          }

          // NEW MESSAGE
          const newMessage = { ...data, isOwnMessage: data.sender?.id === currentUserId };
          setMessages((prev) => [newMessage, ...prev]);

          // Cập nhật chat list trong store
          const { chatList } = useAppStore.getState();
          const senderUsername = data.sender?.username;

          if (senderUsername && chatList.length > 0) {
            const foundChat = chatList.find((c) => c.id === data.chatId); // dùng id chat
            if (foundChat) {
              const updatedChat = {
                ...foundChat,
                lastMessage: { ...foundChat.lastMessage, body: data.content },
                updatedAt: new Date().toISOString(), // đảm bảo thời gian mới nhất
                notReadMessageCount:
                  foundChat.notReadMessageCount + (newMessage.isOwnMessage ? 0 : 1),
              };
              const otherChats = chatList.filter((c) => c.id !== data.chatId);

              const newChatList = [updatedChat, ...otherChats].sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
              );

              useAppStore.setState({ chatList: newChatList });

              if (!newMessage.isOwnMessage) {
                toast(`💬 ${data.sender.username}: ${data.content}`);
              }
            }
          }
        } catch (error) {
          console.error("❌ Error parsing socket message:", error);
        }
      });

      subscribedChatIdRef.current = chatId;
    };

    client.activate();

    // Heartbeat check
    intervalRef.current = setInterval(() => {
      if (!client.connected && isTokenValid()) {
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

  return { messages, loading, currentUserId };
}
