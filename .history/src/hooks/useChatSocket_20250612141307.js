"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function useChatSocket(chatId, onMessage) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = useCallback((data) => {
    if (!data) return;

    onMessage?.(data);

    const sender = data?.sender;
    if (sender && data?.content) {
      toast(`💬 ${sender.username}: ${data.content}`, {
        duration: 4000,
        position: "top-right",
      });
    }
  }, [onMessage]);

  useEffect(() => {
    if (!chatId) return;
    let isActive = true;

    const initializeChatSocket = async () => {
      const token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log(`⚠️ No valid token for chat:${chatId}`);
        return;
      }

      const client = createStompClient();
      clientRef.current = client;

      // Ghi đè callback onConnect
      client.onConnect = () => {
        if (!isActive) return;
        console.log(`🔌 Connected to chat:${chatId}`);
        setIsConnected(true);

        try {
          subscriptionRef.current = client.subscribeToChannel(
            `/chat/${chatId}`,
            (data) => handleMessage(data)
          );
        } catch (error) {
          console.error(`❌ Error subscribing to chat:${chatId}:`, error);
        }
      };

      // Ghi đè onDisconnect nếu cần
      client.onDisconnect = () => {
        setIsConnected(false);
        console.log(`🚫 Disconnected from chat:${chatId}`);
      };

      client.activate();

      try {
        await waitForConnection(client, 10000);
        console.log(`✅ Chat WebSocket connection established [chat:${chatId}]`);
      } catch (error) {
        console.warn(`⚠️ Connection timeout [chat:${chatId}]`, error);
      }
    };

    initializeChatSocket();

    return () => {
      isActive = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log(`📤 Unsubscribed from chat:${chatId}`);
        } catch (error) {
          console.warn(`⚠️ Error unsubscribing from chat:${chatId}`, error);
        }
        subscriptionRef.current = null;
      }

      console.log(`❌ Cleanup chat:${chatId}`);
    };
  }, [chatId, handleMessage]);

  const sendMessage = useCallback((messageData) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.error(`❌ Cannot send message to chat:${chatId} - not connected`);
      return false;
    }
    return client.sendMessage(`/app/chat/${chatId}`, messageData);
  }, [chatId]);

  return {
    sendMessage,
    isConnected
  };
}
