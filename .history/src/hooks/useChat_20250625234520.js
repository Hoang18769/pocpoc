"use client";

import { useEffect, useState, useRef } from "react";
import api, { isTokenValid } from "@/utils/axios";
import { getStompClient } from "@/utils/socket"; // ⭐ Sử dụng singleton
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const clientRef = useRef(null);
  const subscriptionRef = useRef(null); // ⭐ Track subscription thay vì subscribedChatIdRef
  const intervalRef = useRef(null);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để cập nhật chatList
  const updateChatList = (newMessage) => {
    console.log("🔄 Processing message for chatList:", newMessage);
    
    const { chatList } = useAppStore.getState();
    console.log("📜 Current chatList:", chatList);
    
    const foundChat = chatList.find((c) => c.chatId === chatId);
    console.log("🔍 Found chat:", foundChat);

    if (foundChat) {
      console.log("🔍 Current latestMessage:", foundChat.latestMessage);
      console.log("🆕 New message structure:", {
        id: newMessage.id,
        content: newMessage.content,
        sentAt: newMessage.sentAt,
        sender: newMessage.sender
      });

      const updatedChat = {
        ...foundChat,
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

  // Load messages khi chatId thay đổi
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

  // WebSocket connection và subscription
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    let isSubscribed = false;

    const setupConnection = async () => {
      try {
        console.log(`🔌 Setting up connection for chat: ${chatId}`);
        
        // ⭐ Sử dụng singleton getStompClient
        const client = await getStompClient(() => {
          console.log(`✅ Connected to WebSocket [chat:${chatId}]`);
        });

        clientRef.current = client;

        // ⭐ Unsubscribe từ subscription cũ nếu có
        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.unsubscribe();
            console.log("🔄 Unsubscribed from previous chat");
          } catch (err) {
            console.warn("⚠️ Error unsubscribing:", err);
          }
        }

        // ⭐ Subscribe với method mới từ singleton
        const subscription = client.subscribeToChannel(`/chat/${chatId}`, (message) => {
          if (!isSubscribed) return; // Tránh xử lý message sau khi component unmount

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
            
            // Cập nhật chatList ngay lập tức
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

        subscriptionRef.current = subscription;
        isSubscribed = true;
        
        console.log(`✅ Subscribed to chat: ${chatId}`);

      } catch (error) {
        console.error("❌ Failed to setup WebSocket connection:", error);
      }
    };

    setupConnection();

    // ⭐ Loại bỏ interval check vì singleton đã handle reconnection
    // Chỉ setup connection status monitoring nếu cần
    intervalRef.current = setInterval(() => {
      if (clientRef.current) {
        const status = clientRef.current.connected ? "✅ connected" : "❌ disconnected";
        console.log(`[chat:${chatId}] Status: ${status}`);
      }
    }, 30000); // Giảm frequency xuống 30s

    // Cleanup function
    return () => {
      console.log(`🧹 Cleaning up WebSocket [chat:${chatId}]`);
      
      isSubscribed = false;
      
      // Unsubscribe
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("✅ Unsubscribed successfully");
        } catch (err) {
          console.warn("⚠️ Error during unsubscribe:", err);
        }
        subscriptionRef.current = null;
      }

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // ⭐ KHÔNG deactivate client vì nó là singleton
      // Chỉ clear reference
      clientRef.current = null;
      
      console.log(`✅ Cleaned up WebSocket [chat:${chatId}]`);
    };
  }, [chatId, currentUserId]);

  // ⭐ Thêm method để send message thông qua singleton
  const sendMessage = (destination, message, headers = {}) => {
    if (clientRef.current && clientRef.current.sendMessage) {
      return clientRef.current.sendMessage(destination, message, headers);
    } else {
      console.error("❌ Client not available for sending message");
      return false;
    }
  };

  return { 
    messages, 
    loading, 
    currentUserId, 
    sendMessage // ⭐ Export method để component có thể gửi tin nhắn
  };
}