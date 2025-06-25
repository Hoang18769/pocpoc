"use client";

import { useEffect, useRef, useState } from "react";
import { createStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { isTokenValid } from "@/utils/axios";
import { useRouter } from "next/navigation";

export default function useMessageNotification(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  // Store actions
  const { fetchChatList, onMessageReceived, onChatCreated, selectChat } = useAppStore();

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setCurrentUserId(uid);
  }, []);

  // Hàm helper để cập nhật chatList
  const updateChatList = (newMessage, chatId) => {
    console.log("🔄 Processing message for chatList:", newMessage);
    const { chatList } = useAppStore.getState();
    console.log("📜 Current chatList:", chatList);

    const foundChat = chatList.find((c) => c.chatId === chatId);
    if (foundChat) {
      const updatedChat = {
        ...foundChat,
        latestMessage: {
          id: newMessage.id,
          content: newMessage.content,
          sentAt: newMessage.sentAt,
          sender: newMessage.sender,
          messageType: newMessage.messageType,
          attachment: newMessage.attachment,
          attachments: newMessage.attachments,
          deleted: newMessage.deleted || false,
        },
        updatedAt: newMessage.sentAt,
        notReadMessageCount:
          (foundChat.notReadMessageCount || 0) + (newMessage.isOwnMessage ? 0 : 1),
      };
      const otherChats = chatList.filter((c) => c.chatId !== chatId);
      const newChatList = [...otherChats, updatedChat].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      useAppStore.setState({ chatList: newChatList.map((chat) => ({ ...chat })) });

      console.log("✅ ChatList updated successfully!");
    } else {
      console.warn(`⚠️ Không tìm thấy chat với chatId: ${chatId}`);
    }
  };

  useEffect(() => {
    if (!userId || !currentUserId) return;
    let isMounted = true;

    const handleMessage = async (messageData) => {
      if (!messageData) return;

      console.log("📨 New message received:", messageData);

      try {
        // Command xử lý riêng
        if (messageData.command === "DELETE") {
          toast(`🗑️ Tin nhắn đã bị xóa`, {
            duration: 3000,
            position: "top-right",
          });
          return;
        }

        if (messageData.command === "EDIT") {
          const senderName = messageData.sender?.username || messageData.sender?.givenName || "ai đó";
          if (messageData.sender?.id !== currentUserId) {
            toast(`✏️ ${senderName} đã chỉnh sửa tin nhắn`, {
              duration: 3000,
              position: "top-right",
            });
          }
          return;
        }

        const newMessage = {
          ...messageData,
          isOwnMessage: messageData.sender?.id === currentUserId,
        };

        // Cập nhật chat list
        if (messageData.chatId) {
          requestAnimationFrame(() => {
            updateChatList(newMessage, messageData.chatId);
          });
        }

        // Toast thông báo kèm click handler
        if (
          messageData.sender &&
          messageData.content &&
          !newMessage.isOwnMessage
        ) {
          const senderName = messageData.sender.username || messageData.sender.givenName || "ai đó";

          toast(
            (t) => (
              <div
                onClick={() => {
                  selectChat(messageData.chatId);
                  router.push("/chats");
                  toast.dismiss(t.id);
                }}
                className="cursor-pointer"
              >
                💬 {senderName}: {messageData.content}
              </div>
            ),
            {
              duration: 4000,
              position: "top-right",
            }
          );
        }

        if (onMessageReceived) {
          onMessageReceived(messageData);
        }

        window.dispatchEvent(
          new CustomEvent("newMessageReceived", {
            detail: messageData,
          })
        );
      } catch (error) {
        console.error("❌ Failed to process message:", error);
      }
    };

    // === Setup socket client ===
    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      if (!isMounted) return;
      try {
        subscriptionRef.current = client.subscribe(`/message/${userId}`, (message) => {
          try {
            const messageData = JSON.parse(message.body);
            handleMessage(messageData);
          } catch (error) {
            console.error("❌ Parse message error:", error);
          }
        });
      } catch (error) {
        console.error("❌ Lỗi subscribe to messages:", error);
      }
    };
    client.onDisconnect = () => isMounted && console.warn(`🔌 Disconnected from [userId:${userId}]`);
    client.onStompError = (frame) => isMounted && console.error("❌ Message STOMP error:", frame);
    client.onWebSocketError = (error) => isMounted && console.error("❌ Message WebSocket error:", error);

    try {
      client.activate();
    } catch (error) {
      console.error("❌ Lỗi kích hoạt message client:", error);
    }

    intervalRef.current = setInterval(() => {
      if (!client.connected && isTokenValid()) {
        client.deactivate().then(() => {
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

      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, currentUserId, onMessageReceived, selectChat, router]);

  // Method để gửi message qua STOMP client
  const sendMessage = (destination, message) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(message) });
    } else {
      console.warn("⚠️ STOMP client is not connected");
    }
  };

  // Debug status
  const getConnectionStatus = () => ({
    isConnected: clientRef.current?.connected || false,
    hasSubscription: !!subscriptionRef.current,
    userId,
    currentUserId,
  });

  return {
    sendMessage,
    getConnectionStatus,
  };
}