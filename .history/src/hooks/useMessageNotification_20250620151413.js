// hooks/useMessageNotification.js
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useChat } from './useChat'; // Import hook useChat của bạn

const useMessageNotification = (userId, token) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const { getChatById } = useChat(); // Giả sử useChat có method getChatById

  useEffect(() => {
    if (!userId || !token) {
      return;
    }

    // Tạo kết nối WebSocket
    const connectSocket = () => {
      try {
        // Thay đổi URL này theo backend của bạn
        const wsUrl = `ws://localhost:3001/message/${userId}?token=${token}`;
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
          console.log('✅ Message socket connected');
          setIsConnected(true);
        };

        socketRef.current.onmessage = async (event) => {
          try {
            const messageData = JSON.parse(event.data);
            console.log('📨 New message received:', messageData);

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
                            {messageData.sender?.name || 'Người dùng'}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                            {messageData.content || messageData.message || 'Tin nhắn mới'}
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
                toast.success(`Tin nhắn mới từ ${messageData.sender?.name || 'người dùng'}`, {
                  icon: '📨',
                  duration: 4000,
                });
              }
            }

          } catch (error) {
            console.error('Error parsing message data:', error);
          }
        };

        socketRef.current.onclose = (event) => {
          console.log('❌ Message socket disconnected:', event.code, event.reason);
          setIsConnected(false);
          
          // Tự động reconnect sau 3 giây
          if (event.code !== 1000) { // Không phải close bình thường
            setTimeout(() => {
              console.log('🔄 Attempting to reconnect message socket...');
              connectSocket();
            }, 3000);
          }
        };

        socketRef.current.onerror = (error) => {
          console.error('❌ Message socket error:', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Error creating message socket:', error);
        setIsConnected(false);
      }
    };

    connectSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [userId, token, getChatById]);

  // Method để gửi message qua socket (nếu cần)
  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('Socket is not connected');
    }
  };

  return {
    isConnected,
    sendMessage
  };
};

export default useMessageNotification;