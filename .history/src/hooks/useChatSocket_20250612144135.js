"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createStompClient, waitForConnection } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function useChatSocket(chatId, onMessage) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleMessage = useCallback((message) => {
    if (!message) return;

    // Lấy data từ parsedBody nếu có, không thì dùng body
    const data = message.parsedBody || (message.body ? JSON.parse(message.body) : message);
    
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
        console.log(`⚠️ Không có token hợp lệ cho chat:${chatId}`);
        return;
      }

      setIsConnecting(true);

      try {
        // Tạo client với các callback được truyền vào options
        const client = createStompClient({
          onConnect: (frame) => {
            if (!isActive) return;
            
            console.log(`🔌 Đã kết nối tới chat:${chatId}`, frame);
            setIsConnected(true);
            setIsConnecting(false);

            // Subscribe tới channel chat
            try {
              subscriptionRef.current = client.subscribeToChannel(
                `/chat/${chatId}`,
                handleMessage
              );
              console.log(`📋 Đã subscribe tới /chat/${chatId}`);
            } catch (error) {
              console.error(`❌ Lỗi khi subscribe tới chat:${chatId}:`, error);
            }
          },
          
          onDisconnect: (frame) => {
            if (isActive) {
              setIsConnected(false);
              setIsConnecting(false);
              console.log(`🚫 Ngắt kết nối khỏi chat:${chatId}`, frame);
            }
          },
          
          onError: (error) => {
            console.error(`❌ Lỗi WebSocket cho chat:${chatId}:`, error);
            setIsConnected(false);
            setIsConnecting(false);
            toast.error(`Lỗi kết nối chat: ${error.message || 'Không xác định'}`);
          },
          
          onStateChange: (state) => {
            console.log(`🔄 Trạng thái kết nối chat:${chatId} -> ${state}`);
            if (state === 'CONNECTING' || state === 'RECONNECTING') {
              setIsConnecting(true);
            } else if (state === 'CONNECTED') {
              setIsConnected(true);
              setIsConnecting(false);
            } else {
              setIsConnected(false);
              setIsConnecting(false);
            }
          },
          
          // Cấu hình reconnection
          maxReconnectAttempts: 5,
          reconnectDelay: 3000,
          debug: process.env.NODE_ENV === 'development'
        });

        clientRef.current = client;
        
        // Kích hoạt kết nối
        client.activate();

        // Đợi kết nối được thiết lập
        try {
          await waitForConnection(client, 10000);
          console.log(`✅ Kết nối WebSocket chat đã được thiết lập [chat:${chatId}]`);
        } catch (error) {
          console.warn(`⚠️ Timeout kết nối [chat:${chatId}]`, error);
          setIsConnecting(false);
        }

      } catch (error) {
        console.error(`❌ Lỗi khởi tạo kết nối chat:${chatId}:`, error);
        setIsConnected(false);
        setIsConnecting(false);
      }
    };

    initializeChatSocket();

    // Cleanup function
    return () => {
      isActive = false;

      // Unsubscribe từ channel
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log(`📤 Đã unsubscribe khỏi chat:${chatId}`);
        } catch (error) {
          console.warn(`⚠️ Lỗi khi unsubscribe khỏi chat:${chatId}`, error);
        }
        subscriptionRef.current = null;
      }

      // Đóng kết nối client
      if (clientRef.current) {
        try {
          // Sử dụng gracefulDisconnect nếu có trong enhanced socket
          if (typeof clientRef.current.gracefulDisconnect === 'function') {
            clientRef.current.gracefulDisconnect();
          } else {
            clientRef.current.deactivate();
          }
          console.log(`🔌 Đã đóng kết nối client chat:${chatId}`);
        } catch (error) {
          console.warn(`⚠️ Lỗi khi đóng kết nối chat:${chatId}`, error);
        }
        clientRef.current = null;
      }

      setIsConnected(false);
      setIsConnecting(false);
      console.log(`❌ Cleanup hoàn tất cho chat:${chatId}`);
    };
  }, [chatId, handleMessage]);

  // Hàm gửi tin nhắn với error handling tốt hơn
  const sendMessage = useCallback(async (messageData) => {
    const client = clientRef.current;
    
    if (!client) {
      console.error(`❌ Client chưa được khởi tạo cho chat:${chatId}`);
      toast.error('Chưa kết nối tới chat');
      return false;
    }

    // Kiểm tra trạng thái kết nối
    if (!client.connected) {
      console.error(`❌ Không thể gửi tin nhắn tới chat:${chatId} - chưa kết nối`);
      toast.error('Chưa kết nối tới chat, tin nhắn sẽ được gửi khi kết nối lại');
      
      // Nếu có message queue (từ enhanced socket), tin nhắn sẽ được queue
      return client.sendMessage(`/app/chat/${chatId}`, messageData);
    }

    try {
      const success = client.sendMessage(`/app/chat/${chatId}`, messageData);
      if (success) {
        console.log(`📤 Đã gửi tin nhắn tới chat:${chatId}:`, messageData);
      }
      return success;
    } catch (error) {
      console.error(`❌ Lỗi khi gửi tin nhắn tới chat:${chatId}:`, error);
      toast.error(`Lỗi gửi tin nhắn: ${error.message}`);
      return false;
    }
  }, [chatId]);

  // Hàm reconnect thủ công
  const reconnect = useCallback(() => {
    console.log(`🔄 Reconnect thủ công cho chat:${chatId}`);
    
    const client = clientRef.current;
    if (client) {
      try {
        if (typeof client.gracefulDisconnect === 'function') {
          client.gracefulDisconnect();
        } else {
          client.deactivate();
        }
      } catch (error) {
        console.warn('Lỗi khi disconnect:', error);
      }
    }
    
    // Trigger useEffect để tạo kết nối mới
    // Có thể implement logic reconnect tại đây
  }, [chatId]);

  return {
    sendMessage,
    reconnect,
    isConnected,
    isConnecting,
    // Thêm một số thông tin hữu ích
    connectionState: isConnecting ? 'connecting' : (isConnected ? 'connected' : 'disconnected')
  };
}