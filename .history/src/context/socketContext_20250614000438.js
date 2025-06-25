import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createStompClient } from '../utils/socket';
import { getAuthToken, onTokenRefresh, isTokenValid } from '../utils/axios';

const SocketContext = createContext({
  client: null,
  isConnected: false,
  subscribe: () => {},
  unsubscribe: () => {},
});

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

export function SocketProvider({ children }) {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState(new Map());
  const [retryCount, setRetryCount] = useState(0);

  const connectSocket = useCallback(() => {
    if (!isTokenValid()) {
      console.log('Skipping socket connection - invalid token');
      return null;
    }

    const token = getAuthToken();
    const client = createStompClient({
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      // Tự động reconnect với delay
      reconnectDelay: RETRY_DELAY_MS,
    });

    client.onConnect = (frame) => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      setRetryCount(0); // Reset retry count khi connect thành công
      
      // Resubscribe các kênh đã đăng ký
      subscriptions.forEach(({ destination, callback }) => {
        const sub = client.subscribe(destination, callback);
        console.log(`Resubscribed to ${destination}`);
        return sub;
      });
    };

    client.onDisconnect = () => {
      console.log('⚠️ Socket disconnected');
      setIsConnected(false);
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
        console.log(`Retrying connection in ${delay}ms (attempt ${retryCount + 1})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connectSocket();
        }, delay);
      }
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame.headers.message);
      setIsConnected(false);
    };

    try {
      client.activate();
      setStompClient(client);
      return client;
    } catch (error) {
      console.error('Failed to activate STOMP client:', error);
      return null;
    }
  }, [subscriptions, retryCount]);

  const subscribe = useCallback((destination, callback) => {
    const subscriptionId = `sub-${Date.now()}-${destination}`;
    
    setSubscriptions(prev => {
      const newSubscriptions = new Map(prev);
      newSubscriptions.set(subscriptionId, { destination, callback });
      return newSubscriptions;
    });

    if (stompClient && isConnected) {
      try {
        const sub = stompClient.subscribe(destination, callback);
        console.log(`Subscribed to ${destination}`);
        return () => {
          sub.unsubscribe();
          setSubscriptions(prev => {
            const newSubscriptions = new Map(prev);
            newSubscriptions.delete(subscriptionId);
            return newSubscriptions;
          });
        };
      } catch (error) {
        console.error(`Failed to subscribe to ${destination}:`, error);
      }
    }

    return () => {}; // Trả về hàm cleanup mặc định
  }, [stompClient, isConnected]);

  const unsubscribe = useCallback((subscriptionId) => {
    setSubscriptions(prev => {
      const newSubscriptions = new Map(prev);
      const sub = newSubscriptions.get(subscriptionId);
      
      if (sub && stompClient && isConnected) {
        try {
          stompClient.unsubscribe(sub.destination);
          console.log(`Unsubscribed from ${sub.destination}`);
        } catch (error) {
          console.error(`Failed to unsubscribe from ${sub.destination}:`, error);
        }
      }
      
      newSubscriptions.delete(subscriptionId);
      return newSubscriptions;
    });
  }, [stompClient, isConnected]);

  useEffect(() => {
    let client = null;
    let tokenRefreshUnsubscribe = null;

    const initializeSocket = () => {
      if (client) {
        client.deactivate().catch(console.error);
      }
      client = connectSocket();
    };

    if (isTokenValid()) {
      initializeSocket();
    }

    tokenRefreshUnsubscribe = onTokenRefresh((newToken) => {
      if (newToken) {
        console.log('🔄 Reconnecting socket with new token');
        initializeSocket();
      } else {
        // Token bị xóa (logout)
        if (client) {
          client.deactivate().catch(console.error);
          setIsConnected(false);
        }
      }
    });

    return () => {
      if (client) {
        client.deactivate().catch(console.error);
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