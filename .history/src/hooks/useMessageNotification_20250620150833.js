// hooks/useMessageNotification.js
"use client";

import { useEffect, useRef, useState } from "react";
import { createStompClient } from "@/utils/socket";
import { isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useMessageNotification(userId, token) {
  const clientRef = useRef(null);
  const intervalRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Lấy các action từ store
  const { chatList, setChatList, fetchChatList } = useAppStore();

  // Hàm cập nhật chatList khi nhận được message mới
  const updateChatListWithNewMessage = (messageData) => {
    console.log("🔄 [MessageNotification] Updating chatList with:", messageData);
    
    const { chatId, sender, content, sentAt, messageType, attachment, attachments } = messageData;
    
    // Tìm chat trong danh sách hiện tại
    const existingChatIndex = chatList.findIndex(chat => chat.chatId === chatId);
    
    if (existingChatIndex !== -1) {
      // Chat đã có trong danh sách, cập nhật
      const updatedChatList = [...chatList];
      const existingChat = updatedChatList[existingChatIndex];
      
      updatedChatList[existingChatIndex] = {
        ...existingChat,
        latestMessage: {
          id: messageData.id || Date.now(),
          content: content,
          sentAt: sentAt,
          sender: sender,
          messageType: messageType || 'text',
          attachment: attachment,
          attachments: attachments,
          deleted: false
        },
        updatedAt: sentAt,
        notReadMessageCount: (existingChat.notReadMessageCount || 0) + 1,
      };
      
      // Sắp xếp lại theo thời gian mới nhất
      updatedChatList.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setChatList(updatedChatList);
      console.log("✅ [MessageNotification] Updated existing chat in list");
      
    } else {
      // Chat chưa có trong danh sách, fetch lại toàn bộ chatList
      console.log("📋 [MessageNotification] New chat detected, fetching chat list");
      fetchChatList();
    }
  };

  // Khởi tạo socket connection
  useEffect(() => {
    if (!userId || !token) return;

    console.log(`🔌 [MessageNotification] Initializing socket for user: ${userId}`);

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log(`🔌 [MessageNotification] Connected to WebSocket for user: ${userId}`);
      setIsConnected(true);

      // Subscribe vào channel message của user
      client.subscribe(`/message/${userId}`, (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log(`📩 [MessageNotification] Received message:`, messageData);

          // Cập nhật chatList
          updateChatListWithNewMessage(messageData);

          // Hiển thị notification toast
          if (messageData.sender && messageData.content) {
            const senderName = messageData.sender.displayName || messageData.sender.username;
            const messageContent = messageData.messageType === 'file' 
              ? getFileTypeDisplay(messageData.attachment?.fileName, messageData.attachment?.fileType)
              : messageData.content;
            
            toast(`💬 ${senderName}: ${messageContent}`, {
              duration: 4000,
              position: "top-right",
              onClick: () => {
                // Có thể thêm logic để mở chat khi click vào toast
                console.log(`Opening chat: ${messageData.chatId}`);
              }
            });
          }

          // Broadcast event cho các component khác có thể listen
          window.dispatchEvent(new CustomEvent('newMessageReceived', {
            detail: messageData
          }));

        } catch (err) {
          console.error(`❌ [MessageNotification] Error parsing message:`, err);
        }
      });
    };

    client.onDisconnect = () => {
      console.warn(`🔌 [MessageNotification] Disconnected from WebSocket`);
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error("❌ [MessageNotification] STOMP error:", frame);
      setIsConnected(false);
    };

    client.onWebSocketError = (err) => {
      console.error("❌ [MessageNotification] WebSocket error:", err);
      setIsConnected(false);
    };

    client.activate();

    // Reconnection interval
    intervalRef.current = setInterval(() => {
      if (!client.connected && isTokenValid()) {
        console.log("🔁 [MessageNotification] Reconnecting...");
        setIsConnected(false);
        
        client.deactivate().then(() => {
          const newClient = createStompClient();
          clientRef.current = newClient;
          newClient.onConnect = client.onConnect;
          newClient.onDisconnect = client.onDisconnect;
          newClient.onStompError = client.onStompError;
          newClient.onWebSocketError = client.onWebSocketError;
          newClient.activate();
        });
      } else if (client.connected) {
        console.log(`[MessageNotification] Status: ✅ connected`);
      }
    }, 15000);

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsConnected(false);
      console.log("❌ [MessageNotification] Cleaned up WebSocket");
    };
  }, [userId, token]);

  // Helper function để hiển thị loại file
  const getFileTypeDisplay = (fileName, fileType) => {
    if (!fileName && !fileType) return "📎 File";
    
    if (fileType?.startsWith('image/')) return "📷 Hình ảnh";
    if (fileType?.startsWith('video/')) return "🎥 Video";
    if (fileType?.startsWith('audio/')) return "🎵 Audio";
    if (fileType?.includes('pdf')) return "📄 PDF";
    if (fileType?.includes('document') || fileType?.includes('word')) return "📝 Document";
    
    return `📎 ${fileName || 'File'}`;
  };

  return {
    isConnected,
    // Có thể thêm các method khác nếu cần
  };
}