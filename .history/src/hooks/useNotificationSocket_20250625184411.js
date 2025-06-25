"use client";

import { useEffect, useRef, useState } from "react";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { isTokenValid } from "@/utils/axios";

export default function useOnlineNotification(userId) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const reconnectRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const { chatList, updateChatUserOnlineStatus } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Helper lấy tên user
  const getUserName = (targetUserId) => {
    for (const chat of chatList) {
      if (chat.target?.id === targetUserId) return chat.target.fullName || chat.target.username || chat.target.name;
      const participant = chat.participants?.find((p) => p.id === targetUserId);
      if (participant) return participant.fullName || participant.username || participant.name;
    }
    return targetUserId;
  };

  // Helper xử lý status
  const handleOnlineStatusUpdate = (statusData) => {
    if (!statusData || !statusData.userId) return;
    const { userId: targetUserId, isOnline, lastOnline } = statusData;

    // Cập nhật chatList
    chatList.forEach((chat) => {
      const isInChat = chat.target?.id === targetUserId || chat.participants?.some((p) => p.id === targetUserId);
      if (isInChat) {
        updateChatUserOnlineStatus?.(chat.chatId || chat.id, targetUserId, {
          isOnline,
          lastOnline,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    // Hiện toast
    const hasChats = chatList.some((chat) => chat.target?.id === targetUserId || chat.participants?.some((p) => p.id === targetUserId));
    if (hasChats) {
      const name = getUserName(targetUserId);
      if (isOnline) {
        toast.success(`🟢 ${name} đã online`);
      } else {
        toast(`🔴 ${name} đã offline${lastOnline ? ` (Lần cuối: ${new Date(lastOnline).toLocaleString()})` : ""}`);
      }
    }

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("onlineStatusChanged", {
        detail: { userId: targetUserId, isOnline, lastOnline },
      })
    );
  };

  useEffect(() => {
    if (!userId || !currentUserId) return;

    let isMounted = true;
    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      if (!isMounted) return;

      // Hủy subscription cũ
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

      subscriptionRef.current = client.subscribe(`/online/${userId}`, (message) => {
        try {
          const statusData = JSON.parse(message.body);
          handleOnlineStatusUpdate(statusData);
        } catch (e) {
          console.error("❌ Parse online status error:", e);
        }
      });

      console.log(`✅ Subscribed to /online/${userId}`);
    };
    client.onDisconnect = () => isMounted && console.warn(`🔌 Online client disconnected`);
    client.onStompError = (frame) => isMounted && console.error(`❌ STOMP Error:`, frame);
    client.onWebSocketError = (error) => isMounted && console.error(`❌ WebSocket Error:`, error);

    client.activate();

    // Reconnect
    reconnectRef.current = setInterval(() => {
      if (isMounted && clientRef.current && !clientRef.current.connected && isTokenValid()) {
        clientRef.current.deactivate().then(() => {
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
      if (clientRef.current) clientRef.current.deactivate();
      if (reconnectRef.current) clearInterval(reconnectRef.current);
    };
  }, [userId, currentUserId, chatList]);

  const publishOnlineStatus = (status, targetUserId = null) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: targetUserId ? `/online/${targetUserId}` : `/online/broadcast`,
        body: JSON.stringify({ userId: currentUserId, status, timestamp: new Date().toISOString(), targetUserId })
      });
    } else {
      console.warn(`⚠️ Client not connected to publish status`);
    }
  };

  const getUserOnlineStatus = (targetUserId) => {
    for (const chat of chatList) {
      const participant = chat.participants?.find((p) => p.id === targetUserId);
      if (participant?.onlineStatus) return participant.onlineStatus;
      if (chat.target?.id === targetUserId) return chat.target.onlineStatus;
    }
    return null;
  };

  const getConnectionStatus = () => ({
    isConnected: clientRef.current?.connected || false,
    userId,
    currentUserId,
    subscriptionTopic: `/online/${userId}`,
  });

  return {
    publishOnlineStatus,
    getUserOnlineStatus,
    getConnectionStatus,
  };
}
