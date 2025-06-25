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

      client.subscribe(`/chat/${chatId}`, (message) => {
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

            if (data.sender?.id !== currentUserId && data.sender?.username) {
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

          // ✅ Cập nhật chatList
          const { chatList } = useAppStore.getState();
          const senderUsername = data.sender?.username;

          if (senderUsername && chatList.length > 0) {
            const foundChat = chatList.find(
              (chat) => chat.target?.username === senderUsername
            );

            if (foundChat) {
              const updatedChat = {
                ...foundChat,
                lastMessage: newMessage,
                updatedAt: data.sentAt || new Date().toISOString(),
                notReadMessageCount:
                  (foundChat.notReadMessageCount || 0) +
                  (data.sender?.id === currentUserId ? 0 : 1),
              };
              const otherChats = chatList.filter((c) => c.id !== foundChat.id);

              useAppStore.setState({ chatList: [updatedChat, ...otherChats] });

              console.log(
                `📥 ChatList updated with new message for: ${senderUsername}`
              );
            } else {
              console.log(
                `🔍 Không tìm thấy chat nào của ${senderUsername}, không thay đổi danh sách chat`
              );
            }
          }

          // Toast preview new message
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
      if (!connected && isTokenValid()) {
        console.log(`🔁 Reconnecting to chat:${chatId}...`);
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          subscribedChatIdRef.current = null;
          newClient.onConnect = client.onConnect;
          newClient.activate();
        });
      } else {
        console.log(
          `[chat:${chatId}] Status: ${connected ? "✅ connected" : "❌ disconnected"}`
        );
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
