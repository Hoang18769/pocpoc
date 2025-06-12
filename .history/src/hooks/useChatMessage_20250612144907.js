"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";

export default function useChatMessages({ chatId, username }) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        console.log("🔌 Unsubscribed from chat messages");
      } catch (err) {
        console.error("❌ Error unsubscribing:", err);
      }
    }

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
        clientRef.current = null;
        console.log("🔌 STOMP client deactivated");
      } catch (err) {
        console.error("❌ Error deactivating client:", err);
      }
    }

    setIsConnected(false);
    setError(null);
  }, []);

  // Subscribe to messages
  const subscribeToMessages = useCallback(async () => {
    const client = clientRef.current;
    
    if (!client) {
      console.error("❌ No client available for subscription");
      return;
    }

    if (!chatId) {
      console.warn("⚠️ No chatId provided, skipping subscription");
      return;
    }

    try {
      // Đảm bảo client đã connected
      if (!client.connected) {
        console.log("🔄 Waiting for connection before subscribing...");
        await waitForConnection(client, 10000);
      }

      // Unsubscribe existing subscription nếu có
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      const destination = `/topic/chat/${chatId}`;
      console.log("📡 Subscribing to:", destination);

      // Subscribe using the helper method
      const subscription = client.subscribeToChannel(
        destination,
        (message) => {
          try {
            console.log("📥 Raw message received:", message);
            
            let messageData;
            if (typeof message.body === 'string') {
              messageData = JSON.parse(message.body);
            } else {
              messageData = message.body;
            }

            console.log("📥 Parsed message:", messageData);

            // Validate message structure
            if (messageData && (messageData.text || messageData.content)) {
              setMessages(prevMessages => {
                // Kiểm tra duplicate message
                const isDuplicate = prevMessages.some(msg => 
                  msg.id === messageData.id || 
                  (msg.timestamp === messageData.timestamp && msg.text === messageData.text)
                );
                
                if (isDuplicate) {
                  console.log("⚠️ Duplicate message detected, ignoring");
                  return prevMessages;
                }
                
                return [...prevMessages, {
                  id: messageData.id || Date.now(),
                  text: messageData.text || messageData.content,
                  username: messageData.username || messageData.sender,
                  timestamp: messageData.timestamp || new Date().toISOString(),
                  chatId: messageData.chatId,
                  ...messageData
                }];
              });
            } else {
              console.warn("⚠️ Invalid message format:", messageData);
            }
          } catch (err) {
            console.error("❌ Error processing message:", err);
          }
        },
        {}, // headers
        {
          onError: (error) => {
            console.error("❌ Subscription error:", error);
            setError(error.message);
          }
        }
      );

      if (subscription) {
        subscriptionRef.current = subscription;
        console.log("✅ Successfully subscribed to chat messages");
        setError(null);
      } else {
        throw new Error("Failed to create subscription");
      }

    } catch (err) {
      console.error("❌ Failed to subscribe to messages:", err);
      setError(err.message);
    }
  }, [chatId]);

  // Initialize connection
  useEffect(() => {
    let isMounted = true;

    const initializeConnection = async () => {
      try {
        console.log("🚀 Initializing STOMP connection...");
        setError(null);

        const client = createStompClient((frame) => {
          console.log("✅ STOMP connected", frame);
          if (isMounted) {
            setIsConnected(true);
            // Subscribe sau khi connected
            subscribeToMessages();
          }
        });

        clientRef.current = client;
        client.activate();

        // Đợi connection được thiết lập
        try {
          await waitForConnection(client, 15000);
          console.log("✅ Connection established");
        } catch (connectionError) {
          console.error("❌ Connection timeout:", connectionError);
          if (isMounted) {
            setError("Connection timeout");
          }
        }

      } catch (err) {
        console.error("❌ Failed to initialize connection:", err);
        if (isMounted) {
          setError(err.message);
        }
      }
    };

    initializeConnection();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []); // Chỉ chạy một lần khi component mount

  // Re-subscribe khi chatId thay đổi
  useEffect(() => {
    if (isConnected && chatId) {
      console.log("🔄 ChatId changed, resubscribing...", chatId);
      subscribeToMessages();
    }
  }, [chatId, isConnected, subscribeToMessages]);

  // Add message manually (for optimistic updates)
  const addMessage = useCallback((message) => {
    setMessages(prevMessages => {
      const newMessage = {
        id: message.id || Date.now(),
        text: message.text,
        username: message.username || username,
        timestamp: message.timestamp || new Date().toISOString(),
        chatId: chatId,
        ...message
      };
      
      return [...prevMessages, newMessage];
    });
  }, [chatId, username]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Reconnect function
  const reconnect = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return false;

    try {
      console.log("🔄 Reconnecting...");
      setIsConnected(false);
      setError(null);

      // Cleanup current subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      if (client.connected) {
        client.deactivate();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      client.activate();
      await waitForConnection(client, 10000);
      
      setIsConnected(true);
      await subscribeToMessages();
      
      console.log("✅ Reconnection successful");
      return true;
    } catch (err) {
      console.error("❌ Reconnection failed:", err);
      setError(err.message);
      return false;
    }
  }, [subscribeToMessages]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    const client = clientRef.current;
    return {
      hasClient: !!client,
      isActive: client?.active || false,
      isConnected: client?.connected || false,
      hookConnected: isConnected,
      hasSubscription: !!subscriptionRef.current,
      error: error,
      messagesCount: messages.length
    };
  }, [isConnected, error, messages.length]);

  return {
    messages,
    isConnected,
    error,
    addMessage,
    clearMessages,
    reconnect,
    getConnectionStatus
  };
}