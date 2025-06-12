"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createStompClient, waitForConnection, CONNECTION_STATES } from "@/utils/socket";
import { getAuthToken, isTokenValid } from "@/utils/axios";
import { toast } from "react-hot-toast";

// Message types for better handling
export const MESSAGE_TYPES = {
  CHAT: 'CHAT',
  TYPING: 'TYPING',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  MESSAGE_DELIVERED: 'MESSAGE_DELIVERED',
  MESSAGE_READ: 'MESSAGE_READ'
};

export default function useChatSocket(chatId, options = {}) {
  const {
    onMessage,
    onTyping,
    onUserJoined,
    onUserLeft,
    onConnectionChange,
    enableToast = true,
    toastPosition = "top-right",
    toastDuration = 4000,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    debug = false
  } = options;

  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [messageQueue, setMessageQueue] = useState([]);
  const [lastError, setLastError] = useState(null);

  // Derived states
  const isConnected = connectionState === CONNECTION_STATES.CONNECTED;
  const isConnecting = connectionState === CONNECTION_STATES.CONNECTING;
  const isReconnecting = connectionState === CONNECTION_STATES.RECONNECTING;

  // Message handlers
  const handleMessage = useCallback((message) => {
    if (!message || !message.parsedBody) return;

    const data = message.parsedBody;
    const messageType = data.type || MESSAGE_TYPES.CHAT;

    if (debug) {
      console.log(`📥 [Chat:${chatId}] Received ${messageType}:`, data);
    }

    // Handle different message types
    switch (messageType) {
      case MESSAGE_TYPES.CHAT:
        handleChatMessage(data);
        break;
      case MESSAGE_TYPES.TYPING:
        onTyping?.(data);
        break;
      case MESSAGE_TYPES.USER_JOINED:
        onUserJoined?.(data);
        showToast(`👋 ${data.username} joined the chat`, 'success');
        break;
      case MESSAGE_TYPES.USER_LEFT:
        onUserLeft?.(data);
        showToast(`👋 ${data.username} left the chat`, 'info');
        break;
      case MESSAGE_TYPES.MESSAGE_DELIVERED:
      case MESSAGE_TYPES.MESSAGE_READ:
        // Handle message status updates
        onMessage?.(data);
        break;
      default:
        onMessage?.(data);
    }
  }, [chatId, onMessage, onTyping, onUserJoined, onUserLeft, debug]);

  const handleChatMessage = useCallback((data) => {
    onMessage?.(data);

    // Show toast notification
    const sender = data?.sender;
    if (sender && data?.content && enableToast) {
      showToast(`💬 ${sender.username}: ${data.content}`, 'message');
    }
  }, [onMessage, enableToast]);

  const showToast = useCallback((message, type = 'default') => {
    if (!enableToast) return;

    const toastOptions = {
      duration: toastDuration,
      position: toastPosition,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'info':
        toast(message, { ...toastOptions, icon: 'ℹ️' });
        break;
      case 'message':
      default:
        toast(message, toastOptions);
    }
  }, [enableToast, toastDuration, toastPosition]);

  // Connection state handler
  const handleConnectionStateChange = useCallback((newState) => {
    setConnectionState(newState);
    onConnectionChange?.(newState);

    if (debug) {
      console.log(`🔄 [Chat:${chatId}] Connection state: ${newState}`);
    }

    // Clear error when connected
    if (newState === CONNECTION_STATES.CONNECTED) {
      setLastError(null);
      processMessageQueue();
    }
  }, [chatId, onConnectionChange, debug]);

  // Process queued messages when connected
  const processMessageQueue = useCallback(() => {
    if (!clientRef.current?.isReady() || messageQueue.length === 0) return;

    const client = clientRef.current;
    const messagesToSend = [...messageQueue];
    setMessageQueue([]);

    messagesToSend.forEach(({ messageData, resolve, reject }) => {
      try {
        const success = client.sendMessage(`/app/chat/${chatId}`, messageData);
        if (success) {
          resolve(true);
        } else {
          reject(new Error('Failed to send message'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }, [chatId, messageQueue]);

  // Initialize chat socket
  const initializeChatSocket = useCallback(async () => {
    if (!chatId) return;

    const token = getAuthToken();
    if (!token || !isTokenValid()) {
      console.log(`⚠️ [Chat:${chatId}] No valid token`);
      setLastError('Authentication required');
      return;
    }

    try {
      const client = createStompClient({
        onConnect: (frame) => {
          if (debug) console.log(`✅ [Chat:${chatId}] Connected`, frame);
          
          // Subscribe to chat channel
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/chat/${chatId}`,
              handleMessage
            );
          } catch (error) {
            console.error(`❌ [Chat:${chatId}] Subscription error:`, error);
            setLastError('Failed to subscribe to chat');
          }
        },
        onDisconnect: (frame) => {
          if (debug) console.log(`🚫 [Chat:${chatId}] Disconnected`, frame);
        },
        onError: (error) => {
          console.error(`❌ [Chat:${chatId}] Error:`, error);
          setLastError(error.message || 'Connection error');
          showToast('Connection error occurred', 'error');
        },
        onStateChange: handleConnectionStateChange,
        maxReconnectAttempts,
        debug
      });

      clientRef.current = client;
      client.activate();

      // Wait for connection with timeout
      await waitForConnection(client, 10000);
      
    } catch (error) {
      console.error(`❌ [Chat:${chatId}] Connection failed:`, error);
      setLastError(error.message || 'Connection failed');
      
      if (autoReconnect) {
        scheduleReconnect();
      }
    }
  }, [chatId, handleMessage, handleConnectionStateChange, maxReconnectAttempts, debug, autoReconnect]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (connectionState !== CONNECTION_STATES.CONNECTED) {
        console.log(`🔄 [Chat:${chatId}] Attempting to reconnect...`);
        initializeChatSocket();
      }
    }, 5000);
  }, [chatId, connectionState, initializeChatSocket]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
        if (debug) console.log(`📤 [Chat:${chatId}] Unsubscribed`);
      } catch (error) {
        console.warn(`⚠️ [Chat:${chatId}] Unsubscribe error:`, error);
      }
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      try {
        clientRef.current.gracefulDisconnect();
        if (debug) console.log(`🔌 [Chat:${chatId}] Client disconnected`);
      } catch (error) {
        console.warn(`⚠️ [Chat:${chatId}] Disconnect error:`, error);
      }
      clientRef.current = null;
    }

    // Clear queued messages
    setMessageQueue([]);
    setConnectionState(CONNECTION_STATES.DISCONNECTED);
  }, [chatId, debug]);

  // Main effect
  useEffect(() => {
    initializeChatSocket();
    return cleanup;
  }, [initializeChatSocket, cleanup]);

  // Send message function
  const sendMessage = useCallback(async (messageData) => {
    const client = clientRef.current;
    
    if (!client) {
      throw new Error('Client not initialized');
    }

    // If connected, send immediately
    if (client.isReady()) {
      const success = client.sendMessage(`/app/chat/${chatId}`, messageData);
      if (!success) {
        throw new Error('Failed to send message');
      }
      return true;
    }

    // If not connected, queue the message
    return new Promise((resolve, reject) => {
      setMessageQueue(prev => [...prev, { messageData, resolve, reject }]);
      
      // Set timeout for queued message
      setTimeout(() => {
        reject(new Error('Message timeout - not connected'));
      }, 30000); // 30 second timeout
    });
  }, [chatId]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping) => {
    const client = clientRef.current;
    if (!client?.isReady()) return false;

    return client.sendMessage(`/app/chat/${chatId}/typing`, {
      type: MESSAGE_TYPES.TYPING,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }, [chatId]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    cleanup();
    setTimeout(() => {
      initializeChatSocket();
    }, 1000);
  }, [cleanup, initializeChatSocket]);

  // Connection info
  const connectionInfo = useMemo(() => ({
    state: connectionState,
    isConnected,
    isConnecting,
    isReconnecting,
    queuedMessages: messageQueue.length,
    lastError,
    hasSubscription: !!subscriptionRef.current
  }), [connectionState, isConnected, isConnecting, isReconnecting, messageQueue.length, lastError]);

  return {
    // Core functions
    sendMessage,
    sendTyping,
    reconnect,
    
    // Connection state
    isConnected,
    isConnecting,
    isReconnecting,
    connectionState,
    connectionInfo,
    
    // Error handling
    lastError,
    
    // Queue info
    queuedMessagesCount: messageQueue.length
  };
}