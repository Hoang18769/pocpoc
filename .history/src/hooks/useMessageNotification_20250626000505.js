"use client";

import { useEffect, useRef, useState } from "react";
import { getStompClient, getStompClientStatus } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { isTokenValid } from "@/utils/axios";
import { useRouter } from "next/navigation";

export default function useMessageNotification(userId) {
  const subscriptionRef = useRef(null);
  const healthCheckRef = useRef(null);
  const isSubscribedRef = useRef(false);
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
  const handleMessage = async (messageData) => {
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
  };

  // Setup connection với singleton
  const setupConnection = async () => {
    if (!userId || !currentUserId) return;

    try {
      console.log(`🔌 Setting up STOMP connection for user: ${userId}`);
      setConnectionStatus('connecting');
      
      // Get singleton client instance
      const client = await getStompClient(() => {
        console.log(`✅ Connected to STOMP for user: ${userId}`);
        setConnectionStatus('connected');
        
        // Subscribe trong onConnect callback
        if (!isSubscribedRef.current) {
          subscribeToMessages(client);
        }
      });

      // Nếu client đã connected, subscribe ngay
      if (client && client.connected && !isSubscribedRef.current) {
        console.log("🔌 Client already connected, subscribing immediately");
        subscribeToMessages(client);
      }
      
    } catch (error) {
      console.error("❌ Failed to setup STOMP connection:", error);
      setConnectionStatus('error');
    }
  };

  // Tách function subscribe để tái sử dụng
  const subscribeToMessages = (client) => {
    if (isSubscribedRef.current || !client) return;

    try {
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

      if (subscriptionRef.current) {
        isSubscribedRef.current = true;
        console.log(`✅ Successfully subscribed to /message/${userId}`);
      }
    } catch (error) {
      console.error("❌ Subscribe error:", error);
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
        isSubscribedRef.current = false; // Reset subscription flag
        setupConnection();
      } else if (status.connected && connectionStatus !== 'connected') {
        setConnectionStatus('connected');
      }
      
      // Log status periodically for debugging
      // console.log("💓 Health check:", {
      //   connected: status.connected,
      //   subscriptions: status.subscriptions,
      //   reconnectAttempts: status.reconnectAttempts,
      //   hasValidToken: isTokenValid(),
      //   isSubscribed: isSubscribedRef.current
      // });
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

      // Reset flags
      isSubscribedRef.current = false;
      setConnectionStatus('disconnected');
    };
  }, [userId, currentUserId]);

  // Method để gửi message qua STOMP client
  const sendMessage = async (destination, message) => {
    try {
      const client = await getStompClient();
      if (client?.connected) {
        return client.sendMessage(destination, message);
      } else {
        console.warn("⚠️ STOMP client is not connected");
        return false;
      }
    } catch (error) {
      console.error("❌ Send message error:", error);
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
      isSubscribed: isSubscribedRef.current,
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
    isSubscribedRef.current = false; // Reset subscription flag
    setupConnection();
  };

  return {
    sendMessage,
    getConnectionInfo,
    connectionStatus,
    reconnect,
  };
}