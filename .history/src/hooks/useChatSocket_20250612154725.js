"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function useChatSocket(chatId, onMessage) {
  const clientRef = useRef(null);
  const subscribedChatIdRef = useRef(null); // Để kiểm tra đã subscribe chưa
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    if (clientRef.current && clientRef.current.connected && subscribedChatIdRef.current === chatId) {
      // Đã kết nối và đã subscribe rồi, không làm lại
      return;
    }

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 Connected to WebSocket [chat:${chatId}]`);

      const subscription = client.subscribe(`/chat/${chatId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📩 New message received:", data);
          onMessage?.(data);

          if (data?.sender && data?.content) {
            toast(`💬 ${data.sender.username}: ${data.content}`, {
              duration: 4000,
              position: "top-right",
            });
          }
        } catch (err) {
          console.error("❌ Error parsing message:", err);
        }
      });

      subscribedChatIdRef.current = chatId;

      client.onDisconnect = () => {
        console.warn(`🔌 Disconnected from WebSocket [chat:${chatId}]`);
        subscribedChatIdRef.current = null;
      };

      client.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame);
      };

      client.onWebSocketError = (err) => {
        console.error("❌ WebSocket error:", err);
      };
    };

    client.activate();

    // Ping kết nối mỗi 15s
    intervalRef.current = setInterval(() => {
      const connected = client.connected;
      console.log(`[chat:${chatId}] Status: ${connected ? "✅ connected" : "❌ disconnected"}`);

      if (!connected && isTokenValid()) {
        console.log("🔁 Attempting to reconnect...");
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          subscribedChatIdRef.current = null; // reset
          newClient.onConnect = client.onConnect;
          newClient.activate();
        });
      }
    }, 15000);

    return () => {
      client.deactivate();
      clearInterval(intervalRef.current);
      subscribedChatIdRef.current = null;
      console.log(`❌ Cleaned up WebSocket [chat:${chatId}]`);
    };
  }, [chatId]); // Không cần đưa onMessage vào dependency nếu không đổi callback
}
