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

  // Store actions - có thể thêm các actions liên quan đến online status
  const { updateUserOnlineStatus } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để xử lý online status updates
  const handleOnlineStatusUpdate = (statusData) => {
    console.log("🟢 Online status update received:", statusData);
    
    try {
      // Xử lý các loại thông báo online khác nhau
      switch (statusData.type) {
        case "USER_ONLINE":
          console.log(`✅ User ${statusData.username || statusData.userId} is now online`);
          
          // Cập nhật store nếu có function
          if (updateUserOnlineStatus) {
            updateUserOnlineStatus(statusData.userId, true);
          }
          
          // Toast thông báo (có thể tùy chỉnh theo nhu cầu)
          if (statusData.showNotification !== false) {
            toast.success(`🟢 ${statusData.username || statusData.userId} đang online`, {
              duration: 3000,
              position: "top-right",
            });
          }
          break;

        case "USER_OFFLINE":
          console.log(`❌ User ${statusData.username || statusData.userId} is now offline`);
          
          // Cập nhật store nếu có function
          if (updateUserOnlineStatus) {
            updateUserOnlineStatus(statusData.userId, false);
          }
          
          // Toast thông báo (có thể tùy chỉnh theo nhu cầu)
          if (statusData.showNotification !== false) {
            toast(`🔴 ${statusData.username || statusData.userId} đã offline`, {
              duration: 3000,
              position: "top-right",
            });
          }
          break;

        case "FRIEND_ONLINE":
          console.log(`👥 Friend ${statusData.username || statusData.userId} is now online`);
          
          if (updateUserOnlineStatus) {
            updateUserOnlineStatus(statusData.userId, true);
          }
          
          toast.success(`👥 ${statusData.username || statusData.userId} đã online`, {
            duration: 3000,
            position: "top-right",
          });
          break;

        case "FRIEND_OFFLINE":
          console.log(`👥 Friend ${statusData.username || statusData.userId} is now offline`);
          
          if (updateUserOnlineStatus) {
            updateUserOnlineStatus(statusData.userId, false);
          }
          break;

        default:
          console.log(`ℹ️ Unknown online status type: ${statusData.type}`);
          break;
      }

      // Dispatch custom event cho các component khác có thể lắng nghe
      window.dispatchEvent(
        new CustomEvent("onlineStatusChanged", {
          detail: statusData,
        })
      );

    } catch (error) {
      console.error("❌ Failed to process online status update:", error);
    }
  };

  useEffect(() => {
    if (!userId || !currentUserId) return;
    let isMounted = true;

    // === Setup socket client ===
    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      if (!isMounted) return;
      console.log(`🟢 Connected to online notifications for user: ${userId}`);
      
      try {
        // Subscribe to online channel for current user
        subscriptionRef.current = client.subscribe(`/online/${userId}`, (message) => {
          try {
            const statusData = JSON.parse(message.body);
            handleOnlineStatusUpdate(statusData);
          } catch (error) {
            console.error("❌ Parse online status error:", error);
          }
        });
        
        console.log(`✅ Subscribed to /online/${userId}`);
      } catch (error) {
        console.error("❌ Lỗi subscribe to online status:", error);
      }
    };

    client.onDisconnect = () => {
      if (isMounted) {
        console.warn(`🔌 Disconnected from online notifications [userId:${userId}]`);
      }
    };

    client.onStompError = (frame) => {
      if (isMounted) {
        console.error("❌ Online STOMP error:", frame);
      }
    };

    client.onWebSocketError = (error) => {
      if (isMounted) {
        console.error("❌ Online WebSocket error:", error);
      }
    };

    try {
      client.activate();
    } catch (error) {
      console.error("❌ Lỗi kích hoạt online client:", error);
    }

    // Auto-reconnect interval
    intervalRef.current = setInterval(() => {
      if (!client.connected && isTokenValid()) {
        console.log("🔄 Attempting to reconnect online client...");
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          newClient.onConnect = client.onConnect;
          newClient.onDisconnect = client.onDisconnect;
          newClient.onStompError = client.onStompError;
          newClient.onWebSocketError = client.onWebSocketError;
          newClient.activate();
        });
      }
    }, 15000);

    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, currentUserId, updateUserOnlineStatus]);

  // Method để publish online status (nếu cần)
  const publishOnlineStatus = (status, targetUserId = null) => {
    if (clientRef.current?.connected) {
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
    } else {
      console.warn("⚠️ Online STOMP client is not connected");
    }
  };

  // Debug status
  const getConnectionStatus = () => ({
    isConnected: clientRef.current?.connected || false,
    hasSubscription: !!subscriptionRef.current,
    userId,
    currentUserId,
    subscriptionTopic: `/online/${userId}`,
  });

  return {
    publishOnlineStatus,
    getConnectionStatus,
  };
}