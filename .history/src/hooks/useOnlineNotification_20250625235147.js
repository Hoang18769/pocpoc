"use client";
import { useEffect, useRef } from "react";
import { getStompClient } from "@/utils/socket";

export default function useOnlineNotification(userId) {
  const subscriptionRef = useRef(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    console.log("🚀 Setting up online notification for user:", userId);

    // Helper function để xử lý online status
    const handleOnlineStatus = (data) => {
      console.log("🟢 Processing online status:", data);
      // Thêm logic xử lý online/offline status ở đây
      // Ví dụ: cập nhật store, hiển thị indicator, etc.
      
      // Example: Update user online status in store
      // if (data.userId && typeof data.isOnline === 'boolean') {
      //   useAppStore.getState().updateUserOnlineStatus(data.userId, data.isOnline);
      // }
    };

    // === Setup socket client với singleton ===
    const setupOnlineConnection = async () => {
      try {
        console.log("🔌 Connecting to online status socket for user:", userId);
        
        const client = await getStompClient(() => {
          if (!isMounted || isSubscribedRef.current) return;

          console.log("📡 Subscribing to /online/" + userId);
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/online/${userId}`,
              (message) => {
                if (!isMounted) return;
                
                console.log("📨 Raw online message:", message);
                try {
                  const data = JSON.parse(message.body);
                  console.log("📨 Parsed online status:", data);
                  
                  // Xử lý online status
                  handleOnlineStatus(data);
                } catch (err) {
                  console.error("❌ Parse error:", err, "Body:", message.body);
                }
              }
            );
            
            if (subscriptionRef.current) {
              isSubscribedRef.current = true;
              console.log("✅ Successfully subscribed to online channel");
            }
          } catch (err) {
            console.error("❌ Online subscription error:", err);
          }
        });

        // Nếu client đã connected và chưa subscribe
        if (client?.connected && !isSubscribedRef.current) {
          console.log("🔌 Client already connected, subscribing to online channel immediately");
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/online/${userId}`,
              (message) => {
                if (!isMounted) return;
                
                console.log("📨 Raw online message:", message);
                try {
                  const data = JSON.parse(message.body);
                  console.log("📨 Parsed online status:", data);
                  
                  // Xử lý online status
                  handleOnlineStatus(data);
                } catch (err) {
                  console.error("❌ Parse error:", err, "Body:", message.body);
                }
              }
            );
            
            if (subscriptionRef.current) {
              isSubscribedRef.current = true;
              console.log("✅ Successfully subscribed to online channel");
            }
          } catch (err) {
            console.error("❌ Online subscription error:", err);
          }
        }

      } catch (err) {
        console.error("❌ Error setting up online connection:", err);
      }
    };

    setupOnlineConnection();

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up online notification for user:", userId);
      isMounted = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Unsubscribed from online channel");
        } catch (err) {
          console.warn("⚠️ Online unsubscribe error:", err);
        }
        subscriptionRef.current = null;
      }
      
      isSubscribedRef.current = false;
    };
  }, [userId]);

  return null;
}