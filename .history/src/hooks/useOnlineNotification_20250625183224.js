"use client";

import { useEffect, useRef, useState } from "react";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { isTokenValid } from "@/utils/axios";

export default function useOnlineNotification(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connectionState, setConnectionState] = useState('DISCONNECTED'); // Track connection state

  // Store actions
  const { chatList, updateChatUserOnlineStatus } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để cập nhật online status vào chatList
  const updateChatListOnlineStatus = (targetUserId, statusData) => {
    const { isOnline, lastOnline } = statusData;
    
    // Tìm chat có user này
    const affectedChats = chatList.filter(chat => {
      // Kiểm tra trong participants
      if (chat.participants && Array.isArray(chat.participants)) {
        return chat.participants.some(participant => participant.id === targetUserId);
      }
      
      // Kiểm tra target user (chat 1-1)
      if (chat.target && chat.target.id === targetUserId) {
        return true;
      }
      
      return false;
    });

    if (affectedChats.length > 0) {
      console.log(`📊 Updating online status for ${affectedChats.length} chats with user ${targetUserId}`);
      
      // Cập nhật từng chat
      affectedChats.forEach(chat => {
        if (updateChatUserOnlineStatus) {
          updateChatUserOnlineStatus(chat.id || chat.chatId, targetUserId, {
            isOnline,
            lastOnline,
            updatedAt: new Date().toISOString()
          });
        }
      });
    }
  };

  // Hàm helper để xử lý online status updates
  const handleOnlineStatusUpdate = (statusData) => {
    console.log("🟢 Online status update received:", statusData);
    
    try {
      // statusData format: { userId, isOnline, lastOnline }
      const { userId: targetUserId, isOnline, lastOnline } = statusData;
      
      if (!targetUserId) {
        console.warn("⚠️ Missing userId in online status data");
        return;
      }

      console.log(`${isOnline ? '✅' : '❌'} User ${targetUserId} is now ${isOnline ? 'online' : 'offline'}`);
      
      // 1. Cập nhật chatList với online status
      updateChatListOnlineStatus(targetUserId, { isOnline, lastOnline });
      
      // 2. Toast thông báo (chỉ hiện cho users trong chatList)
      const hasChatsWithUser = chatList.some(chat => {
        if (chat.participants && Array.isArray(chat.participants)) {
          return chat.participants.some(participant => participant.id === targetUserId);
        }
        if (chat.target && chat.target.id === targetUserId) {
          return true;
        }
        return false;
      });

      if (hasChatsWithUser) {
        const userName = getUserNameFromChatList(targetUserId);
        
        if (isOnline) {
          toast.success(`🟢 ${userName || `User ${targetUserId}`} đã online`, {
            duration: 3000,
            position: "top-right",
          });
        } else {
          const lastOnlineText = lastOnline 
            ? `\nLần cuối: ${new Date(lastOnline).toLocaleString()}`
            : '';
          
          toast(`🔴 ${userName || `User ${targetUserId}`} đã offline${lastOnlineText}`, {
            duration: 4000,
            position: "top-right",
          });
        }
      }

      // 3. Dispatch custom event với full data
      window.dispatchEvent(
        new CustomEvent("onlineStatusChanged", {
          detail: {
            userId: targetUserId,
            isOnline,
            lastOnline,
            timestamp: new Date().toISOString(),
            hasChatsWithUser
          },
        })
      );

    } catch (error) {
      console.error("❌ Failed to process online status update:", error);
    }
  };

  // Helper để lấy tên user từ chatList
  const getUserNameFromChatList = (targetUserId) => {
    for (const chat of chatList) {
      // Tìm trong participants
      if (chat.participants && Array.isArray(chat.participants)) {
        const participant = chat.participants.find(p => p.id === targetUserId);
        if (participant) {
          return participant.fullName || participant.username || participant.name;
        }
      }
      
      // Tìm trong target
      if (chat.target && chat.target.id === targetUserId) {
        return chat.target.fullName || chat.target.username || chat.target.name;
      }
    }
    return null;
  };

  // ✅ Separate function to handle subscription
  const setupSubscription = (client) => {
    if (!client || !client.connected) {
      console.warn("⚠️ Cannot subscribe - client not connected");
      return;
    }

    try {
      console.log(`🔔 Setting up subscription to /online/${userId}`);
      
      // Unsubscribe existing subscription if any
      if (subscriptionRef.current) {
        console.log("🔄 Cleaning up existing subscription");
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // Subscribe to online channel for current user
      subscriptionRef.current = client.subscribe(`/online/${userId}`, (message) => {
        try {
          console.log("📨 Raw message received:", message);
          const statusData = JSON.parse(message.body);
          console.log("📋 Parsed message data:", statusData);
          handleOnlineStatusUpdate(statusData);
        } catch (error) {
          console.error("❌ Parse online status error:", error);
        }
      });
      
      console.log(`✅ Successfully subscribed to /online/${userId}`);
    } catch (error) {
      console.error("❌ Error setting up subscription:", error);
    }
  };

  useEffect(() => {
    if (!userId || !currentUserId) {
      console.log("⏳ Waiting for userId and currentUserId...", { userId, currentUserId });
      return;
    }

    let isMounted = true;
    console.log(`🚀 Initializing online notifications for user: ${userId}`);

    // === Setup socket client ===
    const client = createStompClient();
    clientRef.current = client;
    setConnectionState('CONNECTING');

    // ✅ Improved connection handler
    client.onConnect = (frame) => {
      if (!isMounted) return;
      
      console.log(`🟢 Connected to online notifications for user: ${userId}`, frame);
      setConnectionState('CONNECTED');
      
      // Setup subscription after successful connection
      setTimeout(() => {
        if (isMounted && client.connected) {
          setupSubscription(client);
        }
      }, 100); // Small delay to ensure connection is fully established
    };

    client.onDisconnect = (frame) => {
      if (isMounted) {
        console.warn(`🔌 Disconnected from online notifications [userId:${userId}]`, frame);
        setConnectionState('DISCONNECTED');
        
        // Clean up subscription
        if (subscriptionRef.current) {
          subscriptionRef.current = null;
        }
      }
    };

    client.onStompError = (frame) => {
      if (isMounted) {
        console.error("❌ Online STOMP error:", frame);
        setConnectionState('ERROR');
      }
    };

    client.onWebSocketError = (error) => {
      if (isMounted) {
        console.error("❌ Online WebSocket error:", error);
        setConnectionState('ERROR');
      }
    };

    // ✅ Improved activation with better error handling
    try {
      console.log("🔌 Activating STOMP client...");
      client.activate();
    } catch (error) {
      console.error("❌ Error activating online client:", error);
      setConnectionState('ERROR');
    }

    // ✅ Improved auto-reconnect interval
    intervalRef.current = setInterval(() => {
      if (!isMounted) return;
      
      const isConnected = client.connected;
      const hasValidToken = isTokenValid();
      
      console.log("🔄 Connection check:", { 
        isConnected, 
        hasValidToken, 
        connectionState,
        hasSubscription: !!subscriptionRef.current 
      });
      
      if (!isConnected && hasValidToken) {
        console.log("🔄 Attempting to reconnect online client...");
        setConnectionState('RECONNECTING');
        
        client.deactivate().then(() => {
          if (!isMounted) return;
          
          const newClient = createStompClient();
          clientRef.current = newClient;
          
          newClient.onConnect = client.onConnect;
          newClient.onDisconnect = client.onDisconnect;
          newClient.onStompError = client.onStompError;
          newClient.onWebSocketError = client.onWebSocketError;
          
          try {
            newClient.activate();
            setConnectionState('CONNECTING');
          } catch (error) {
            console.error("❌ Reconnection failed:", error);
            setConnectionState('ERROR');
          }
        }).catch(error => {
          console.error("❌ Error during deactivation for reconnect:", error);
          setConnectionState('ERROR');
        });
      }
    }, 15000);

    return () => {
      console.log(`🧹 Cleaning up online notifications for user: ${userId}`);
      isMounted = false;
      setConnectionState('DISCONNECTED');

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (error) {
          console.warn("⚠️ Error unsubscribing:", error);
        }
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (error) {
          console.warn("⚠️ Error deactivating client:", error);
        }
        clientRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, currentUserId, chatList]); // Thêm chatList vào dependency

  // Method để publish online status (nếu cần)
  const publishOnlineStatus = (status, targetUserId = null) => {
    if (!clientRef.current?.connected) {
      console.warn("⚠️ Online STOMP client is not connected", { connectionState });
      return;
    }

    try {
      const message = {
        userId: currentUserId,
        status: status, // "ONLINE" | "OFFLINE" | "AWAY"
        timestamp: new Date().toISOString(),
        targetUserId: targetUserId, // nếu muốn gửi cho user cụ thể
      };
      
      const destination = targetUserId ? `/online/${targetUserId}` : `/online/broadcast`;
      clientRef.current.publish({ 
        destination, 
        body: JSON.stringify(message) 
      });
      
      console.log(`📤 Published online status: ${status} to ${destination}`);
    } catch (error) {
      console.error("❌ Error publishing online status:", error);
    }
  };

  // Method để check online status của user cụ thể từ chatList
  const getUserOnlineStatus = (targetUserId) => {
    for (const chat of chatList) {
      // Tìm trong participants
      if (chat.participants && Array.isArray(chat.participants)) {
        const participant = chat.participants.find(p => p.id === targetUserId);
        if (participant && participant.onlineStatus) {
          return participant.onlineStatus;
        }
      }
      
      // Tìm trong target
      if (chat.target && chat.target.id === targetUserId && chat.target.onlineStatus) {
        return chat.target.onlineStatus;
      }
    }
    return null;
  };

  // ✅ Enhanced debug status
  const getConnectionStatus = () => ({
    isConnected: clientRef.current?.connected || false,
    connectionState,
    hasSubscription: !!subscriptionRef.current,
    userId,
    currentUserId,
    subscriptionTopic: `/online/${userId}`,
    chatListCount: chatList.length,
    clientExists: !!clientRef.current,
    timestamp: new Date().toISOString()
  });

  return {
    publishOnlineStatus,
    getUserOnlineStatus,
    getConnectionStatus,
    connectionState, // ✅ Expose connection state
  };
}