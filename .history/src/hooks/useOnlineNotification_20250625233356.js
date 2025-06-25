"use client";
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";

export default function useOnlineNotification(userId) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    console.log("🚀 Setting up online notification for user:", userId);

    // Tạo client mà không có callback trước
    const client = createStompClient();
    clientRef.current = client;

    // Override các event handlers
    const originalOnConnect = client.onConnect;
    client.onConnect = (frame) => {
      if (!isMounted) return;
      
      console.log("✅ STOMP Connected for online notifications");
      isConnectedRef.current = true;
      
      // Gọi original handler nếu có
      if (originalOnConnect) {
        originalOnConnect(frame);
      }

      // Subscribe sau khi đã connect
      try {
        console.log("📡 Subscribing to /online/" + userId);
        
        subscriptionRef.current = client.subscribe(`/online/${userId}`, (message) => {
          console.log("📨 Raw online message:", message);
          try {
            const data = JSON.parse(message.body);
            console.log("📨 Parsed online status:", data);
            
            // Xử lý online status
            handleOnlineStatus(data);
            
          } catch (err) {
            console.error("❌ Parse error:", err, "Body:", message.body);
          }
        });
        
        console.log("✅ Successfully subscribed to online channel");
      } catch (err) {
        console.error("❌ Subscription error:", err);
      }
    };

    client.onDisconnect = (frame) => {
      console.warn("🔌 STOMP Disconnected from online notifications");
      isConnectedRef.current = false;
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP Error in online notification:", frame);
    };

    client.onWebSocketError = (error) => {
      console.error("❌ WebSocket Error in online notification:", error);
    };

    // Helper function để xử lý online status
    const handleOnlineStatus = (data) => {
      console.log("🟢 Processing online status:", data);
      // Thêm logic xử lý online/offline status ở đây
      // Ví dụ: cập nhật store, hiển thị indicator, etc.
    };

    // Activate client
    try {
      client.activate();
    } catch (err) {
      console.error("❌ Client activation error:", err);
    }

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up online notification");
      isMounted = false;
      isConnectedRef.current = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Unsubscribed from online channel");
        } catch (err) {
          console.warn("⚠️ Unsubscribe error:", err);
        }
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
          console.log("🔌 Deactivated online client");
        } catch (err) {
          console.warn("⚠️ Deactivation error:", err);
        }
        clientRef.current = null;
      }
    };
  }, [userId]);

  return null;
}