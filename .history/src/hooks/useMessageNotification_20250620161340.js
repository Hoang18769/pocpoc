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
      console.log('📨 New message received:', messageData);
      if (!messageData) {
        console.warn('⚠️ Message data không hợp lệ:', messageData);
        return;
      }


      // Dispatch custom event để các component khác có thể listen
      window.dispatchEvent(new CustomEvent('newMessageReceived', {
        detail: messageData
      }));

      // Lấy thông tin chat để hiển thị toast
      if (messageData.chatId) {
        try {
          const chatData = await getChatById(messageData.chatId);
          
          // Tạo toast thông báo tin nhắn mới
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={messageData.sender?.avatar || '/default-avatar.png'}
                      alt={messageData.sender?.name || 'User'}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {messageData.sender?.name || messageData.sender?.givenName || 'Người dùng'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                      {messageData.content || messageData.message || messageData.body || 'Tin nhắn mới'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    // Navigate to chat hoặc trigger action
                    window.dispatchEvent(new CustomEvent('openChat', {
                      detail: {
                        chatId: messageData.chatId,
                        targetUser: messageData.sender
                      }
                    }));
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Xem
                </button>
              </div>
            </div>
          ), {
            duration: 5000,
            position: 'top-right',
          });

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

      console.log('✅ Message socket connected'+userId);
      setIsConnected(true);

      console.log('🔌 Subscribing to /message/' + userId);
      try {
        subscriptionRef.current = client.subscribeToChannel(`/message/${userId}`,
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
      console.log('🚀 Activating message client for userId:', userId);
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

  // Debug function để kiểm tra connection status
  const getConnectionStatus = () => {
    return {
      isConnected,
      clientConnected: clientRef.current?.connected || false,
      hasSubscription: !!subscriptionRef.current,
      userId: localStorage.getItem('userId')
    };
  };

  return {
    isConnected,
    sendMessage,
    getConnectionStatus
  };
};

export default useMessageNotification;