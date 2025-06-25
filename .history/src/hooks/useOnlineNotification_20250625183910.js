"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { isTokenValid } from "@/utils/axios";

export default function useOnlineNotification(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const { chatList, updateChatUserOnlineStatus } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  const getUserNameFromChatList = useCallback((targetUserId) => {
    for (const chat of chatList) {
      const participant = chat.participants?.find((p) => p.id === targetUserId);
      if (participant) return participant.fullName || participant.username || participant.name;
      if (chat.target?.id === targetUserId) {
        return chat.target.fullName || chat.target.username || chat.target.name;
      }
    }
    return null;
  }, [chatList]);

  const updateChatListOnlineStatus = useCallback((targetUserId, statusData) => {
    const { isOnline, lastOnline } = statusData;
    chatList.forEach((chat) => {
      const isTargetUser = chat.target?.id === targetUserId ||
        chat.participants?.some((p) => p.id === targetUserId);
      if (isTargetUser && updateChatUserOnlineStatus) {
        updateChatUserOnlineStatus(chat.chatId || chat.id, targetUserId, {
          isOnline,
          lastOnline,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }, [chatList, updateChatUserOnlineStatus]);

  const handleOnlineStatusUpdate = useCallback((statusData) => {
    if (!statusData?.userId) return;
    const { userId: targetUserId, isOnline, lastOnline } = statusData;

    updateChatListOnlineStatus(targetUserId, { isOnline, lastOnline });

    const hasChatsWithUser = chatList.some(
      (chat) =>
        chat.target?.id === targetUserId ||
        chat.participants?.some((p) => p.id === targetUserId)
    );

    if (hasChatsWithUser) {
      const userName = getUserNameFromChatList(targetUserId);
      const lastOnlineText = lastOnline ? ` (Lần cuối: ${new Date(lastOnline).toLocaleString()})` : "";
      if (isOnline) {
        toast.success(`🟢 ${userName || targetUserId} đã online`);
      } else {
        toast(`🔴 ${userName || targetUserId} đã offline${lastOnlineText}`);
      }
    }

    window.dispatchEvent(
      new CustomEvent("onlineStatusChanged", {
        detail: { userId: targetUserId, isOnline, lastOnline, timestamp: new Date().toISOString() },
      })
    );
  }, [chatList, getUserNameFromChatList, updateChatListOnlineStatus]);

  const setupStompClient = useCallback(() => {
    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

      subscriptionRef.current = client.subscribe(`/online/${userId}`, (message) => {
        try {
          const statusData = JSON.parse(message.body);
          handleOnlineStatusUpdate(statusData);
        } catch (error) {
          console.error("❌ Parse online status error:", error);
        }
      });

      console.log(`✅ Subscribed to /online/${userId}`);
    };
    client.onDisconnect = () => console.warn(`🔌 Online client disconnected (${userId})`);
    client.onStompError = (frame) => console.error("❌ STOMP Error:", frame);
    client.onWebSocketError = (error) => console.error("❌ WebSocket Error:", error);

    client.activate();
  }, [userId, handleOnlineStatusUpdate]);

  useEffect(() => {
    if (!userId || !currentUserId) return;
    let isMounted = true;

    setupStompClient();

    intervalRef.current = setInterval(() => {
      const client = clientRef.current;
      if (isMounted && client && !client.connected && isTokenValid()) {
        client.deactivate().then(() => {
          setupStompClient();
        });
      }
    }, 15000);

    return () => {
      isMounted = false;
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (clientRef.current) clientRef.current.deactivate();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, currentUserId, setupStompClient]);

  const publishOnlineStatus = (status, targetUserId = null) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: targetUserId ? `/online/${targetUserId}` : `/online/broadcast`,
        body: JSON.stringify({ userId: currentUserId, status, timestamp: new Date().toISOString(), targetUserId })
      });
      console.log(`📤 Published status: ${status} to ${targetUserId ? `/online/${targetUserId}` : "/online/broadcast"}`);
    } else {
      console.warn("⚠️ Cannot publish online status — client not connected");
    }
  };

  const getUserOnlineStatus = (targetUserId) => {
    for (const chat of chatList) {
      const participant = chat.participants?.find((p) => p.id === targetUserId);
      if (participant?.onlineStatus) return participant.onlineStatus;
      if (chat.target?.id === targetUserId && chat.target.onlineStatus) {
        return chat.target.onlineStatus;
      }
    }
    return null;
  };

  const getConnectionStatus = () => ({
    isConnected: clientRef.current?.connected || false,
    hasSubscription: !!subscriptionRef.current,
    userId,
    currentUserId,
  });

  return {
    publishOnlineStatus,
    getUserOnlineStatus,
    getConnectionStatus,
  };
}
