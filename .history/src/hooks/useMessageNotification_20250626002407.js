"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getStompClient, getStompClientStatus } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { isTokenValid } from "@/utils/axios";
import { useRouter } from "next/navigation";

export default function useMessageNotification(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);
  const healthCheckRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const router = useRouter();

  // Store actions
  const { fetchChatList, onMessageReceived, onChatCreated, selectChat } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để cập nhật chatList
  const updateChatList = (newMessage, chatId) => {
    console.log("🔄 Processing message for chatList:", newMessage);
    const { chatList } = useAppStore.getState();
    console.log("📜 Current chatList:", chatList);

    const foundChat = chatList.find((c) => c.chatId === chatId);
    if (foundChat) {
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
          deleted: newMessage.deleted || false,
        },
        updatedAt: newMessage.sentAt,
        notReadMessageCount:
          (foundChat.notReadMessageCount || 0) + (newMessage.isOwnMessage ? 0 : 1),
      };
      const otherChats = chatList.filter((c) => c.chatId !== chatId);
      const newChatList = [...otherChats, updatedChat].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      useAppStore.setState({ chatList: newChatList.map((chat) => ({ ...chat })) });

      console.log("✅ ChatList updated successfully!");
    } else {
      console.warn(`⚠️ Không tìm thấy chat với chatId: ${chatId}`);
    }
  };

  // Message handler
  const handleMessage = useCallback(async (messageData) => {
    if (!messageData) return;

    console.log("📨 New message received:", messageData);

    try {
      // Command xử lý riêng
      if (messageData.command === "DELETE") {
        toast(`🗑️ Tin nhắn đã bị xóa`, {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      if (messageData.command === "EDIT") {
        const senderName = messageData.sender?.username || messageData.sender?.givenName || "ai đó";
        if (messageData.sender?.id !== currentUserId) {
          toast(`✏️ ${senderName} đã chỉnh sửa tin nhắn`, {
            duration: 3000,
            position: "top-right",
          });
        }
        return;
      }

      const newMessage = {
        ...messageData,
        isOwnMessage: messageData.sender?.id === currentUserId,
      };

      // Cập nhật chat list
      if (messageData.chatId) {
        requestAnimationFrame(() => {
          updateChatList(newMessage, messageData.chatId);
        });
      }

      // Toast thông báo kèm click handler
      if (
        messageData.sender &&
        messageData.content &&
        !newMessage.isOwnMessage
      ) {
        const senderName = messageData.sender.username || messageData.sender.givenName || "ai đó";

        toast(
          (t) => (
            <div
              onClick={() => {
                selectChat(messageData.chatId);
                router.push("/chats");
                toast.dismiss(t.id);
              }}
              className="cursor-pointer"
            >
              💬 {senderName}: {messageData.content}
            </div>
          ),
          {
            duration: 4000,
            position: "top-right",
          }
        );
      }

      if (onMessageReceived) {
        onMessageReceived(messageData);
      }

      window.dispatchEvent(
        new CustomEvent("newMessageReceived", {
          detail: messageData,
        })
      );
    } catch (error) {
      console.error("❌ Failed to process message:", error);
    }
  }, [currentUserId, selectChat, router, onMessageReceived]);

  // Subscribe to messages - chỉ gọi khi client đã connected
  const subscribeToMessages = (client) => {
    if (!client || !client.connected || !userId) {
      console.warn("⚠️ Cannot subscribe: client not ready or userId missing");
      return;
    }

    try {
      console.log(`📡 Subscribing to /message/${userId}`);
      
      // Unsubscribe previous subscription if exists
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      subscriptionRef.current = client.subscribeToChannel(
        `/message/${userId}`, 
        (message) => {
          try {
            const messageData = JSON.parse(message.body);
            handleMessage(messageData);
          } catch (error) {
            console.error("❌ Parse message error:", error);
          }
        }
      );

      console.log(`✅ Successfully subscribed to /message/${userId}`);
    } catch (error) {
      console.error("❌ Failed to subscribe to messages:", error);
    }
  };

  // Setup connection
  const setupConnection = async () => {
    if (!userId || !currentUserId) return;

    try {
      console.log(`🔌 Setting up STOMP connection for user: ${userId}`);
      setConnectionStatus('connecting');
      
      // Get singleton client instance với callback để subscribe khi connected
      const client = await getStompClient(() => {
        console.log(`✅ Connected to STOMP for user: ${userId}`);
        setConnectionStatus('connected');
        
        // Subscribe ngay khi connected (giống như bản cũ)
        subscribeToMessages(clientRef.current);
      });
      
      clientRef.current = client;

      // Nếu client đã connected rồi, subscribe luôn
      if (client && client.connected) {
        console.log("🔌 Client already connected, subscribing immediately");
        subscribeToMessages(client);
        setConnectionStatus('connected');
      }
      
    } catch (error) {
      console.error("❌ Failed to setup STOMP connection:", error);
      setConnectionStatus('error');
    }
  };

  // Health check function
  const startHealthCheck = () => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }

    healthCheckRef.current = setInterval(() => {
      const status = getStompClientStatus();
      
      if (!status.connected && isTokenValid()) {
        console.log("🔄 Health check: Connection lost, attempting to reconnect...");
        setConnectionStatus('reconnecting');
        setupConnection();
      } else if (status.connected && connectionStatus !== 'connected') {
        setConnectionStatus('connected');
        
        // Đảm bảo subscribe nếu chưa có
        if (!subscriptionRef.current && clientRef.current) {
          console.log("🔄 Health check: Re-subscribing to messages");
          subscribeToMessages(clientRef.current);
        }
      }
      
      // Log status periodically for debugging
      console.log("💓 Health check:", {
        connected: status.connected,
        subscriptions: status.subscriptions,
        hasSubscription: !!subscriptionRef.current,
        reconnectAttempts: status.reconnectAttempts,
        hasValidToken: isTokenValid()
      });
    }, 15000);
  };

  // Main effect
  useEffect(() => {
    let isMounted = true;

    const initializeConnection = async () => {
      if (!userId || !currentUserId || !isMounted) return;
      
      await setupConnection();
      startHealthCheck();
    };

    initializeConnection();

    return () => {
      isMounted = false;
      
      // Cleanup subscription
      if (subscriptionRef.current) {
        console.log(`🔌 Unsubscribing from /message/${userId}`);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // Clear health check
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
        healthCheckRef.current = null;
      }

      // Note: We don't disconnect the client here as it's shared
      // The singleton client will handle its own lifecycle
      clientRef.current = null;
      setConnectionStatus('disconnected');
    };
  }, [userId, currentUserId, handleMessage]);

  // Method để gửi message qua STOMP client
  const sendMessage = (destination, message) => {
    if (clientRef.current?.connected) {
      return clientRef.current.sendMessage(destination, message);
    } else {
      console.warn("⚠️ STOMP client is not connected");
      return false;
    }
  };

  // Get detailed connection status
  const getConnectionInfo = () => {
    const status = getStompClientStatus();
    return {
      status: connectionStatus,
      isConnected: status.connected,
      hasSubscription: !!subscriptionRef.current,
      userId,
      currentUserId,
      subscriptions: status.subscriptions,
      reconnectAttempts: status.reconnectAttempts,
    };
  };

  // Manual reconnect function
  const reconnect = () => {
    console.log("🔄 Manual reconnect requested");
    setConnectionStatus('reconnecting');
    setupConnection();
  };

  return {
    sendMessage,
    getConnectionInfo,
    connectionStatus,
    reconnect,
  };
}