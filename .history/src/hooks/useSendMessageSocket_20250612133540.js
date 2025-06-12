"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    const connectClient = () => {
      if (!mounted) return;
      
      console.log("🔌 Creating STOMP client...");
      const client = createStompClient((frame) => {
        if (!mounted) return;
        console.log("✅ STOMP connected in useSendMessage", frame);
        setIsConnected(true);
      });

      client.onDisconnect = () => {
        if (!mounted) return;
        console.log("⚠️ STOMP disconnected in useSendMessage");
        setIsConnected(false);
        
        // Auto-reconnect sau 3 giây nếu không phải do logout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mounted && clientRef.current) {
            console.log("🔄 Auto-reconnecting STOMP...");
            clientRef.current.reconnectWithNewToken();
          }
        }, 3000);
      };

      clientRef.current = client;
      client.activate();
    };

    connectClient();

    return () => {
      mounted = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (error) {
          console.warn("Warning deactivating client:", error);
        }
      }
      
      setIsConnected(false);
      clientRef.current = null;
      console.log("❌ STOMP client cleanup in useSendMessage");
    };
  }, []); // Chỉ chạy 1 lần khi mount

  const sendMessage = useCallback(
    (text) => {
      const client = clientRef.current;

      console.log("📡 Attempting to send...");
      console.log("✅ isConnected:", isConnected);
      console.log("📦 client.connected:", client?.connected);

      // Kiểm tra client và connection status
      if (!client || !client.connected) {
        console.warn("⚠️ STOMP client not ready", {
          hasClient: !!client,
          isConnected: client?.connected,
          stateConnected: isConnected,
        });
        
        // Thử reconnect nếu client exists nhưng không connected
        if (client && !client.connected && !client.active) {
          console.log("🔄 Attempting to reconnect...");
          client.reconnectWithNewToken();
        }
        
        return false;
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      try {
        const success = client.sendMessage("/app/chat", messageData);
        
        if (success) {
          console.log("✅ Message sent:", messageData);
        }
        
        return success;
      } catch (err) {
        console.error("❌ Failed to send message:", err);
        return false;
      }
    },
    [chatId, receiverUsername, isConnected]
  );

  // Thêm method để manual reconnect
  const reconnect = useCallback(() => {
    if (clientRef.current) {
      console.log("🔄 Manual reconnect requested");
      clientRef.current.reconnectWithNewToken();
    }
  }, []);

  return { 
    sendMessage, 
    isConnected,
    reconnect
  };
}