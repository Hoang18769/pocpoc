import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createStompClient } from '../utils/socket';
import { getAuthToken, onTokenRefresh, isTokenValid } from '../utils/axios';

const SocketContext = createContext({
  client: null,
  isConnected: false,
  subscribe: () => {},
  unsubscribe: () => {},
});

export function SocketProvider({ children }) {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState(new Map());

  // Hàm khởi tạo và kết nối socket
  const connectSocket = useCallback(() => {
    if (!isTokenValid()) return;

    const token = getAuthToken();
    const client = createStompClient({
      connectHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    client.onConnect = (frame) => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      
      // Resubscribe các kênh đã đăng ký trước đó
      subscriptions.forEach(({ destination, callback }) => {
        client.subscribe(destination, callback);
      });
    };

    client.onDisconnect = () => {
      console.log('⚠️ Socket disconnected');
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame.headers.message);
      setIsConnected(false);
    };

    client.activate();
    setStompClient(client);

    return client;
  }, [subscriptions]);

  // Hàm subscribe với tự động retry khi mất kết nối
  const subscribe = useCallback((destination, callback) => {
    setSubscriptions(prev => {
      const newSubscriptions = new Map(prev);
      newSubscriptions.set(destination, { destination, callback });
      return newSubscriptions;
    });

    if (stompClient && isConnected) {
      return stompClient.subscribe(destination, callback);
    }
  }, [stompClient, isConnected]);

  // Hàm unsubscribe
  const unsubscribe = useCallback((destination) => {
    setSubscriptions(prev => {
      const newSubscriptions = new Map(prev);
      newSubscriptions.delete(destination);
      return newSubscriptions;
    });

    if (stompClient && isConnected) {
      stompClient.unsubscribe(destination);
    }
  }, [stompClient, isConnected]);

  // Effect khởi tạo socket và xử lý refresh token
  useEffect(() => {
    let client = null;
    let tokenRefreshUnsubscribe = null;

    const initializeSocket = () => {
      if (client) {
        client.deactivate();
      }
      client = connectSocket();
    };

    // Khởi tạo socket lần đầu
    if (isTokenValid()) {
      initializeSocket();
    }

    // Theo dõi sự kiện refresh token để kết nối lại
    tokenRefreshUnsubscribe = onTokenRefresh((newToken) => {
      if (newToken) {
        console.log('🔄 Reconnecting socket with new token');
        initializeSocket();
      } else {
        // Token bị xóa (logout)
        if (client) {
          client.deactivate();
          setIsConnected(false);
        }
      }
    });

    return () => {
      if (client) {
        client.deactivate();
      }
      if (tokenRefreshUnsubscribe) {
        tokenRefreshUnsubscribe();
      }
    };
  }, [connectSocket]);

  return (
    <SocketContext.Provider value={{ 
      client: stompClient, 
      isConnected,
      subscribe,
      unsubscribe
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}