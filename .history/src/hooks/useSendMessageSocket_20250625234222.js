"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getStompClient, getStompClientStatus } from "@/utils/socket";

export default function useSendMessage({ chatId, receiverUsername }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const statusCheckRef = useRef(null);

  // Initialize connection
  const initializeClient = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    
    try {
      console.log("🔌 Initializing STOMP client for sending messages...");
      
      // Get singleton client instance
      const client = await getStompClient((frame) => {
        console.log("✅ STOMP connected for sending", frame);
        setIsConnected(true);
      });
      
      clientRef.current = client;
      
      // Check if already connected
      if (client && client.connected) {
        setIsConnected(true);
        console.log("✅ Client already connected");
      }
      
    } catch (error) {
      console.error("❌ Failed to initialize STOMP client:", error);
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Status monitoring
  const startStatusMonitoring = useCallback(() => {
    if (statusCheckRef.current) {
      clearInterval(statusCheckRef.current);
    }

    statusCheckRef.current = setInterval(() => {
      const status = getStompClientStatus();
      const newConnectionState = status.connected;
      
      if (newConnectionState !== isConnected) {
        setIsConnected(newConnectionState);
        console.log(`🔄 Connection status changed: ${newConnectionState}`);
      }
      
      // If not connected and not initializing, try to reconnect
      if (!newConnectionState && !isInitializing) {
        console.log("🔄 Auto-reconnecting for send message...");
        initializeClient();
      }
    }, 5000);
  }, [isConnected, isInitializing, initializeClient]);

  // Setup effect
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      if (!isMounted) return;
      
      await initializeClient();
      startStatusMonitoring();
    };

    setup();

    return () => {
      isMounted = false;
      
      // Clear status monitoring
      if (statusCheckRef.current) {
        clearInterval(statusCheckRef.current);
        statusCheckRef.current = null;
      }
      
      // Don't disconnect the client as it's shared
      // Just clear our reference
      clientRef.current = null;
      setIsConnected(false);
      setIsInitializing(false);
      
      console.log("🔌 useSendMessage cleanup completed");
    };
  }, [initializeClient, startStatusMonitoring]);

  // Send message function
  const sendMessage = useCallback(
    async (text) => {
      console.log("📡 Attempting to send message...");
      
      // Get current client status
      const status = getStompClientStatus();
      const client = clientRef.current;
      
      console.log("📊 Send status check:", {
        hasClient: !!client,
        clientConnected: client?.connected,
        statusConnected: status.connected,
        stateConnected: isConnected,
        isInitializing,
      });

      // If not connected, try to get/reconnect client
      if (!client || !client.connected || !status.connected) {
        console.log("🔄 Client not ready, attempting to reconnect...");
        
        try {
          const freshClient = await getStompClient();
          clientRef.current = freshClient;
          
          if (!freshClient.connected) {
            console.warn("⚠️ STOMP client still not connected after refresh");
            return {
              success: false,
              error: "Connection not available"
            };
          }
        } catch (error) {
          console.error("❌ Failed to get fresh client:", error);
          return {
            success: false,
            error: "Failed to establish connection"
          };
        }
      }

      // Validate input
      if (!text || !text.trim()) {
        console.warn("⚠️ Empty message text");
        return {
          success: false,
          error: "Message text is required"
        };
      }

      // Prepare message data
      const messageData = {
        chatId: chatId || null,
        username: receiverUsername?.trim(),
        text: text.trim(),
      };

      console.log("📦 Sending message data:", messageData);

      try {
        // Use the sendMessage method from singleton client
        const success = clientRef.current.sendMessage("/app/chat", messageData);
        
        if (success) {
          console.log("✅ Message sent successfully:", messageData);
          return {
            success: true,
            data: messageData
          };
        } else {
          console.error("❌ Failed to send message - client method returned false");
          return {
            success: false,
            error: "Send operation failed"
          };
        }
        
      } catch (error) {
        console.error("❌ Exception while sending message:", error);
        return {
          success: false,
          error: error.message || "Unknown error occurred"
        };
      }
    },
    [chatId, receiverUsername, isConnected, isInitializing]
  );

  // Manual reconnect function
  const reconnect = useCallback(async () => {
    console.log("🔄 Manual reconnect requested for send message");
    setIsConnected(false);
    await initializeClient();
  }, [initializeClient]);

  // Get detailed status
  const getDetailedStatus = useCallback(() => {
    const globalStatus = getStompClientStatus();
    return {
      isConnected,
      isInitializing,
      hasClient: !!clientRef.current,
      clientConnected: clientRef.current?.connected || false,
      globalStatus,
      chatId,
      receiverUsername,
    };
  }, [isConnected, isInitializing, chatId, receiverUsername]);

  return {
    sendMessage,
    isConnected,
    isInitializing,
    reconnect,
    getDetailedStatus,
  };
}