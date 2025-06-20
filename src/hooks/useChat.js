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
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để cập nhật chatList
// Trong useChat hook, sửa updateChatList function:
const updateChatList = (newMessage) => {
  console.log("🔄 Processing message for chatList:", newMessage);
  
  const { chatList } = useAppStore.getState();
  console.log("📜 Current chatList:", chatList);
  
  const foundChat = chatList.find((c) => c.chatId === chatId);
  console.log("🔍 Found chat:", foundChat);

  if (foundChat) {
    console.log("🔍 Current latestMessage:", foundChat.latestMessage); // ⭐ SỬA TÊN FIELD
    console.log("🆕 New message structure:", {
      id: newMessage.id,
      content: newMessage.content,
      sentAt: newMessage.sentAt,
      sender: newMessage.sender
    });

    const updatedChat = {
      ...foundChat,
      // ⭐ SỬA TỪ lastMessage THÀNH latestMessage
      latestMessage: {
        id: newMessage.id,
        content: newMessage.content,
        sentAt: newMessage.sentAt,
        sender: newMessage.sender,
        messageType: newMessage.messageType,
        attachment: newMessage.attachment,
        attachments: newMessage.attachments,
        deleted: newMessage.deleted || false
      },
      updatedAt: newMessage.sentAt,
      notReadMessageCount:
        (foundChat.notReadMessageCount || 0) + (newMessage.isOwnMessage ? 0 : 1),
    };
    
    console.log("🆕 UpdatedChat latestMessage:", updatedChat.latestMessage);
    
    const otherChats = chatList.filter((c) => c.chatId !== chatId);
    const newChatList = [...otherChats, updatedChat].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    console.log("📜 New chatList first item latestMessage:", newChatList[0]?.latestMessage);
    
    // Force update bằng cách tạo object mới hoàn toàn
    useAppStore.setState({ 
      chatList: newChatList.map(chat => ({...chat}))
    });
    
    console.log("✅ ChatList updated successfully!");
    
    // Verify update
    setTimeout(() => {
      const { chatList: updatedList } = useAppStore.getState();
      console.log("🔍 Verified latestMessage after update:", updatedList.find(c => c.chatId === chatId)?.latestMessage);
    }, 100);
  } else {
    console.warn(`⚠️ Không tìm thấy chat với chatId: ${chatId}`);
  }
};

  useEffect(() => {
    if (!chatId) return;
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/chat/messages/${chatId}?page=0&size=100`);
        setMessages(res.data.body || []);
      } catch (err) {
        console.error("❌ Lỗi tải tin nhắn:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    if (clientRef.current?.connected && subscribedChatIdRef.current === chatId) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);

      client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📩 Received:", data);

          if (data.command === "DELETE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.id ? { ...msg, content: "[Tin nhắn đã bị xóa]", deleted: true } : msg
              )
            );
            return;
          }

          if (data.command === "EDIT") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.id
                  ? { ...msg, content: data.message, edited: true, editedAt: data.editedAt || new Date().toISOString() }
                  : msg
              )
            );

            if (data.sender?.id !== currentUserId) {
              toast(`✏️ ${data.sender.username} đã chỉnh sửa tin nhắn`, {
                duration: 3000,
                position: "top-right",
              });
            }
            return;
          }

          // NEW MESSAGE
          const newMessage = { ...data, isOwnMessage: data.sender?.id === currentUserId };
          console.log("📩 Processing new message:", newMessage);
          console.log("🆔 Current userId:", currentUserId);
          console.log("🆔 Sender ID:", data.sender?.id);
          
          // Cập nhật messages state
          setMessages((prev) => {
            console.log("📝 Previous messages count:", prev.length);
            const newMessages = [newMessage, ...prev];
            console.log("📝 New messages count:", newMessages.length);
            return newMessages;
          });
          
          // Cập nhật chatList ngay lập tức - không dùng state
          // Sử dụng requestAnimationFrame để đảm bảo DOM đã render
          requestAnimationFrame(() => {
            updateChatList(newMessage);
          });

          if (data.sender && data.content && !newMessage.isOwnMessage) {
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
      if (!client.connected && isTokenValid()) {
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
          `[chat:${chatId}] Status: ${client.connected ? "✅ connected" : "❌ disconnected"}`
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

  return { messages, loading, currentUserId };
}