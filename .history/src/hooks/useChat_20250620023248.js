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
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=100`);
        setMessages(res.data.body);
      } catch (err) {
        console.error("❌ Lỗi khi tải tin nhắn", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, currentUserId]);

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

      const subscription = client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📩 New message received:", data);

          // DELETE
          if (data.command === "DELETE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.id
                  ? { ...msg, content: "[Tin nhắn đã bị xóa]", deleted: true }
                  : msg
              )
            );
            return;
          }

          // EDIT
          if (data.command === "EDIT") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.id
                  ? {
                      ...msg,
                      content: data.message,
                      edited: true,
                      editedAt: data.editedAt || new Date().toISOString(),
                    }
                  : msg
              )
            );

            const isOwnEdit = data.sender?.id === currentUserId;
            if (!isOwnEdit && data.sender?.username) {
              toast(`✏️ ${data.sender.username} đã chỉnh sửa tin nhắn`, {
                duration: 3000,
                position: "top-right",
              });
            }
            return;
          }

          // NEW MESSAGE
          const newMessage = {
            ...data,
            isOwnMessage: data.sender?.id === currentUserId,
          };

          setMessages((prev) => [newMessage, ...prev]);

          // 👉 Update chatList
          const { chatList } = useAppStore.getState();
          const senderUsername = data.sender?.username;

          if (senderUsername && chatList.length > 0) {
            const foundChat = chatList.find(
              (chat) => chat.target?.username === senderUsername
            );

            if (foundChat) {
              const updatedChat = {
                ...foundChat,
                lastMessage: {
                  ...foundChat.lastMessage,
                  body: data.content,
                },
                updatedAt: data.sentAt || new Date().toISOString(),
                notReadMessageCount:
                  (foundChat.notReadMessageCount || 0) +
                  (data.sender?.id === currentUserId ? 0 : 1),
              };

              const newChatList = [
                updatedChat,
                ...chatList
                  .filter((chat) => chat.id !== foundChat.id)
                  .sort((a, b) => new Date(a.sentAt) - new Date(b.updatedAt)),
              ];

              useAppStore.setState({ chatList: newChatList });
              console.log("📥 ChatList updated from useChat with new message");
            }
          }

          if (data?.sender && data?.content && !newMessage.isOwnMessage) {
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
  }, [chatId, currentUserId]);

  return {
    messages,
    loading,
    currentUserId,
  };
}
