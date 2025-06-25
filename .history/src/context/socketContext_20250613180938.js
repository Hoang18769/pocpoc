import { createContext, useContext, useEffect, useState } from 'react';
import { createStompClient } from '../utils/socket';

const SocketContext = createContext({
  client: null,
  isConnected: false,
});

export function SocketProvider({ children }) {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = createStompClient((frame) => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

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

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ client: stompClient, isConnected }}>
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