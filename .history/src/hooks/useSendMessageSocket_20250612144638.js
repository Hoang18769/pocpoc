"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeConnection = async () => {
      try {
        setConnectionError(null);
        
        const client = createStompClient((frame) => {
          console.log("✅ STOMP connected", frame);
          if (isMounted) {
            setIsConnected(true);
          }
        });

        // Gán client reference ngay lập tức
        clientRef.current = client;
        
        // Activate client
        client.activate();

        // Đợi connection được thiết lập
        try {
          await waitForConnection(client, 10000); // 10s timeout
          console.log("✅ Connection established and ready");
        } catch (error) {
          console.error("❌ Connection timeout:", error);
          if (isMounted) {
            setConnectionError("Connection timeout");
          }
        }

      } catch (error) {
        console.error("❌ Failed to initialize connection:", error);
        if (isMounted) {
          setConnectionError(error.message);
        }
      }
    };

    initializeConnection();

    return () => {
      isMounted = false;
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (error) {
          console.error("❌ Error deactivating client:", error);
        }
      }
      setIsConnected(false);
      clientRef.current = null;
      console.log("🔌 STOMP client deactivated");
    };
  }, []); // Chỉ chạy một lần khi mount

  const sendMessage = useCallback(
    async (text) => {
      const client = clientRef.current;

      console.log("📡 Attempting to send...");
      console.log("✅ Hook isConnected:", isConnected);
      console.log("📦 Client connected:", client?.connected);
      console.log("📦 Client active:", client?.active);

      // Validation đầu vào
      if (!text || !text.trim()) {
        console.warn("⚠️ Empty message text");
        return false;
      }

      if (!receiverUsername || !receiverUsername.trim()) {
        console.warn("⚠️ Missing receiver username");
        return false;
      }

      // Kiểm tra client existence
      if (!client) {
        console.error("❌ STOMP client not initialized");
        return false;
      }

      // Đợi connection nếu chưa connected
      if (!client.connected) {
        console.log("🔄 Client not connected, waiting...");
        try {
          await waitForConnection(client, 5000);
          setIsConnected(true);
        } catch (error) {
          console.error("❌ Failed to establish connection:", error);
          return false;
        }
      }

      const messageData = {
        chatId: chatId || null,
        username: receiverUsername.trim(),
        text: text.trim(),
        timestamp: new Date().toISOString(), // Thêm timestamp
      };

      console.log("📤 Sending message data:", messageData);

      try {
        // Kiểm tra lại trước khi gửi
        if (!client.connected) {
          throw new Error("Client disconnected before sending");
        }

        // Sử dụng helper method nếu có, hoặc publish trực tiếp
        if (typeof client.sendMessage === 'function') {
          const success = client.sendMessage("/app/chat", messageData);
          if (success) {
            console.log("✅ Message sent successfully:", messageData);
            return true;
          } else {
            console.error("❌ Failed to send message via helper");
            return false;
          }
        } else {
          // Fallback to direct publish
          client.publish({
            destination: "/app/chat",
            body: JSON.stringify(messageData),
            headers: {
              'content-type': 'application/json'
            }
          });
          
          console.log("✅ Message published:", messageData);
          return true;
        }
      } catch (err) {
        console.error("❌ Failed to send message:", err);
        
        // Reset connection state nếu có lỗi connection
        if (err.message.includes('disconnected') || err.message.includes('connection')) {
          setIsConnected(false);
        }
        
        return false;
      }
    },
    [chatId, receiverUsername, isConnected]
  );

  // Helper để check connection health
  const checkConnection = useCallback(() => {
    const client = clientRef.current;
    return {
      hasClient: !!client,
      isActive: client?.active || false,
      isConnected: client?.connected || false,
      hookConnected: isConnected,
      error: connectionError
    };
  }, [isConnected, connectionError]);

  // Helper để force reconnect
  const reconnect = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return false;

    try {
      console.log("🔄 Forcing reconnection...");
      setIsConnected(false);
      setConnectionError(null);
      
      if (client.connected) {
        client.deactivate();
        // Đợi một chút trước khi reconnect
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      client.activate();
      await waitForConnection(client, 10000);
      setIsConnected(true);
      
      console.log("✅ Reconnection successful");
      return true;
    } catch (error) {
      console.error("❌ Reconnection failed:", error);
      setConnectionError(error.message);
      return false;
    }
  }, []);

  return { 
    sendMessage, 
    isConnected, 
    connectionError,
    checkConnection,
    reconnect 
  };
}