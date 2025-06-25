// hooks/useMessageNotification.js
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { createStompClient } from '@/utils/socket';

const useMessageNotification = () => {
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    // Lấy userId từ localStorage
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      console.warn('⚠️ Không tìm thấy userId trong localStorage');
      return;
    }

    let isMounted = true;

    const handleMessage = async (messageData) => {
      if (!messageData) {
        console.warn('⚠️ Message data không hợp lệ:', messageData);
        return;
      }

      console.log('📨 New message received:', messageData);

      // Dispatch custom event để các component khác có thể listen
      window.dispatchEvent(new CustomEvent('newMessageReceived', {
        detail: messageData
      }));

      // Lấy thông tin chat để hiển thị toast
      if (messageData.chatId) {
        try {          
          toast("new message",)
        } catch (error) {
          console.error('Error fetching chat data:', error);
          // Fallback toast nếu không lấy được chat data
          const senderName = messageData.sender?.name || messageData.sender?.givenName || 'người dùng';
          toast.success(`Tin nhắn mới từ ${senderName}`, {
            icon: '📨',
            duration: 4000,
          });
        }
      } else {
        // Fallback nếu không có chatId
        const senderName = messageData.sender?.name || messageData.sender?.givenName || 'người dùng';
        toast.success(`Tin nhắn mới từ ${senderName}`, {
          icon: '📨',
          duration: 4000,
        });
      }
    };

    // === Setup STOMP client ===
    const client = createStompClient((frame) => {
      if (!isMounted) return;

      console.log('✅ Message socket connected');
      setIsConnected(true);

      console.log('🔌 Subscribing to /messages/' + userId);
      try {
        subscriptionRef.current = client.subscribeToChannel(
          `/messages/${userId}`,
          (message) => {
            try {
              const messageData = JSON.parse(message.body);
              console.log('📨 Message received via STOMP:', messageData);
              handleMessage(messageData);
            } catch (err) {
              console.error('❌ Không thể parse message:', err);
            }
          }
        );
      } catch (err) {
        console.error('❌ Lỗi khi subscribe to messages:', err);
        setIsConnected(false);
      }
    });

    clientRef.current = client;

    // Handle connection events
    client.onConnect = (frame) => {
      if (!isMounted) return;
      console.log('✅ Message socket connected');
      setIsConnected(true);
    };

    client.onDisconnect = () => {
      if (!isMounted) return;
      console.log('❌ Message socket disconnected');
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      if (!isMounted) return;
      console.error('❌ Message socket STOMP error:', frame);
      setIsConnected(false);
    };

    client.onWebSocketError = (error) => {
      if (!isMounted) return;
      console.error('❌ Message socket WebSocket error:', error);
      setIsConnected(false);
    };

    try {
      client.activate();
    } catch (err) {
      console.error('❌ Lỗi kích hoạt message client:', err);
      setIsConnected(false);
    }

    // Cleanup function
    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log('📤 Đã hủy đăng ký /messages');
        } catch (err) {
          console.warn('⚠️ Lỗi khi hủy đăng ký messages:', err);
        }
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
          console.log('🔌 Đã ngắt kết nối message client');
        } catch (err) {
          console.warn('⚠️ Lỗi khi ngắt kết nối message client:', err);
        }
        clientRef.current = null;
      }
    };
  }, []);

  // Method để gửi message qua STOMP client (nếu cần)
  const sendMessage = (destination, message) => {
    if (clientRef.current && clientRef.current.connected) {
      try {
        clientRef.current.publish({
          destination: destination,
          body: JSON.stringify(message)
        });
        console.log('📤 Message sent via STOMP:', message);
      } catch (error) {
        console.error('❌ Error sending message via STOMP:', error);
      }
    } else {
      console.warn('⚠️ STOMP client is not connected');
    }
  };

  return {
    isConnected,
    sendMessage
  };
};

export default useMessageNotification;