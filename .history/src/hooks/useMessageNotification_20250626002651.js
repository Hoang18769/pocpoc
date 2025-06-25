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
  const { onMessageReceived, selectChat } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để cập nhật chatList
  const updateChatList = useCallback((newMessage, chatId) => {
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
  }, []);

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
  }, [currentUserId, updateChatList, selectChat, router, onMessageReceived]);

  // Subscribe to messages - đơn giản hóa vì singleton đã quản lý
  const subscribeToMessages = useCallback(async () => {
    if (!userId) {
      console.warn("⚠️ Cannot subscribe: userId missing");
      return;
    }

    try {
      console.log(`📡 Setting up subscription for /message/${userId}`);
      
      // Get client (sẽ tự động kết nối nếu chưa)
      const client = await getStompClient(() => {
        console.log(`✅ STOMP connected for user: ${userId}`);
        setConnectionStatus('connected');
      });
      
      clientRef.current = client;

      // Subscribe (singleton sẽ tự động resubscribe khi reconnect)
      if (client && client.connected) {
        console.log(`📡 Subscribing to /message/${userId}`);
        
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

        setConnectionStatus('connected');
        console.log(`✅ Successfully subscribed to /message/${userId}`);
      } else {
        setConnectionStatus('connecting');
      }
      
    } catch (error) {
      console.error("❌ Failed to setup subscription:", error);
      setConnectionStatus('error');
    }
  }, [userId, handleMessage]);

  // Health check function
  const startHealthCheck = useCallback(() => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }

    healthCheckRef.current = setInterval(() => {
      const status = getStompClientStatus();
      
      // Update connection status based on actual client status
      if (status.connected && connectionStatus !== 'connected') {
        setConnectionStatus('connected');
      } else if (!status.connected && connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
      }
      
      // Log status for debugging
      console.log("💓 Health check:", {
        connected: status.connected,
        connecting: status.connecting,
        subscriptions: status.subscriptions,
        reconnectAttempts: status.reconnectAttempts,
        hasValidToken: isTokenValid(),
        currentStatus: connectionStatus
      });
      
      // Singleton sẽ tự động reconnect, chúng ta chỉ cần theo dõi
      
    }, 15000);
  }, [connectionStatus]);

  // Main effect
  useEffect(() => {
    let isMounted = true;

    const initializeConnection = async () => {
      if (!userId || !currentUserId || !isMounted) return;
      
      console.log(`🚀 Initializing message notification for user: ${userId}`);
      
      await subscribeToMessages();
      startHealthCheck();
    };

    initializeConnection();

    return () => {
      isMounted = false;
      
      // Clear health check
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
        healthCheckRef.current = null;
      }

      // Note: Không cần unsubscribe vì singleton tự quản lý
      // và có thể có nhiều component khác cũng đang sử dụng
      subscriptionRef.current = null;
      clientRef.current = null;
      setConnectionStatus('disconnected');
      
      console.log(`🔌 Cleaned up message notification for user: ${userId}`);
    };
  }, [userId, currentUserId, subscribeToMessages, startHealthCheck]);

  // Method để gửi message qua STOMP client
  const sendMessage = useCallback((destination, message) => {
    if (clientRef.current?.connected) {
      return clientRef.current.sendMessage(destination, message);
    } else {
      console.warn("⚠️ STOMP client is not connected");
      return false;
    }
  }, []);

  // Get detailed connection status
  const getConnectionInfo = useCallback(() => {
    const status = getStompClientStatus();
    return {
      status: connectionStatus,
      isConnected: status.connected,
      isConnecting: status.connecting,
      hasSubscription: !!subscriptionRef.current,
      userId,
      currentUserId,
      subscriptions: status.subscriptions,
      reconnectAttempts: status.reconnectAttempts,
    };
  }, [connectionStatus, userId, currentUserId]);

  // Manual reconnect function - thực tế singleton tự reconnect
  const reconnect = useCallback(() => {
    console.log("🔄 Manual reconnect requested");
    setConnectionStatus('reconnecting');
    subscribeToMessages();
  }, [subscribeToMessages]);

  return {
    sendMessage,
    getConnectionInfo,
    connectionStatus,
    reconnect,
  };
}