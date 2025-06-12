// src/utils/socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid } from "./axios";

// Connection states
export const CONNECTION_STATES = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  RECONNECTING: 'RECONNECTING',
  ERROR: 'ERROR'
};

export function createStompClient(options = {}) {
  const {
    onConnect,
    onDisconnect,
    onError,
    onStateChange,
    maxReconnectAttempts = 5,
    reconnectDelay = 5000,
    heartbeatIncoming = 10000,
    heartbeatOutgoing = 10000,
    debug = false
  } = options;

  let connectionState = CONNECTION_STATES.DISCONNECTED;
  let reconnectAttempts = 0;
  let subscriptions = new Map(); // Track active subscriptions
  let messageQueue = []; // Queue messages when disconnected

  const updateConnectionState = (newState) => {
    if (connectionState !== newState) {
      connectionState = newState;
      if (onStateChange) onStateChange(newState);
    }
  };

  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost/ws"),
    connectHeaders: {
      Authorization: "Bearer " + (getAuthToken() || ""),
    },
    debug: debug ? (str) => console.log("[STOMP DEBUG]", str) : undefined,
    reconnectDelay,
    heartbeatIncoming,
    heartbeatOutgoing,
    
    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);
      updateConnectionState(CONNECTION_STATES.CONNECTED);
      reconnectAttempts = 0;
      
      // Process queued messages
      processMessageQueue();
      
      // Resubscribe to channels
      resubscribeToChannels();
      
      if (onConnect) onConnect(frame);
    },
    
    onDisconnect: (frame) => {
      console.warn("⚠️ STOMP disconnected", frame);
      updateConnectionState(CONNECTION_STATES.DISCONNECTED);
      if (onDisconnect) onDisconnect(frame);
    },
    
    onWebSocketClose: (event) => {
      console.warn("⚠️ WebSocket closed", event);
      updateConnectionState(CONNECTION_STATES.DISCONNECTED);
    },
    
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
      updateConnectionState(CONNECTION_STATES.ERROR);
      if (onError) onError(event);
    },
    
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame);
      updateConnectionState(CONNECTION_STATES.ERROR);
      if (onError) onError(frame);
    },
    
    beforeConnect: async () => {
      updateConnectionState(CONNECTION_STATES.CONNECTING);
      
      const token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Token expired or missing, waiting for refresh...");
        await new Promise((r) => setTimeout(r, 500));
      }
      
      // Update headers with fresh token
      client.connectHeaders = {
        Authorization: "Bearer " + (getAuthToken() || ""),
      };
    },
    
    onWebSocketClose: (event) => {
      console.warn("⚠️ WebSocket closed", event);
      
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        updateConnectionState(CONNECTION_STATES.RECONNECTING);
        console.log(`🔄 Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
      } else {
        console.error("❌ Max reconnection attempts reached");
        updateConnectionState(CONNECTION_STATES.ERROR);
      }
    }
  });

  // Process queued messages when connected
  const processMessageQueue = () => {
    while (messageQueue.length > 0 && client.connected) {
      const { destination, message, headers } = messageQueue.shift();
      client.sendMessage(destination, message, headers);
    }
  };

  // Resubscribe to channels after reconnection
  const resubscribeToChannels = () => {
    subscriptions.forEach((callback, destination) => {
      console.log(`🔄 Resubscribing to ${destination}`);
      client.subscribe(destination, callback);
    });
  };

  // Enhanced sendMessage with queuing
  client.sendMessage = (destination, message, headers = {}) => {
    if (!client.connected) {
      console.warn("⚠️ Client not connected. Queuing message...");
      messageQueue.push({ destination, message, headers });
      return false;
    }
    
    try {
      client.publish({
        destination: destination,
        body: JSON.stringify(message),
        headers: {
          'content-type': 'application/json',
          ...headers
        }
      });
      console.log(`📤 Message sent to ${destination}:`, message);
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  };

  // Enhanced subscribe with tracking
  client.subscribeToChannel = (destination, callback, headers = {}) => {
    if (!client.connected) {
      console.error("❌ Client not connected. Cannot subscribe.");
      return null;
    }

    // Store subscription for reconnection
    subscriptions.set(destination, callback);
    
    const subscription = client.subscribe(destination, (message) => {
      try {
        const parsedBody = JSON.parse(message.body);
        console.log(`📥 Message received from ${destination}:`, parsedBody);
        callback({ ...message, parsedBody });
      } catch (error) {
        console.error("❌ Error parsing message:", error);
        callback(message);
      }
    }, headers);

    // Override unsubscribe to remove from tracking
    const originalUnsubscribe = subscription.unsubscribe;
    subscription.unsubscribe = () => {
      subscriptions.delete(destination);
      originalUnsubscribe.call(subscription);
    };

    return subscription;
  };

  // Get current connection state
  client.getConnectionState = () => connectionState;

  // Check if client is ready to send messages
  client.isReady = () => client.connected && connectionState === CONNECTION_STATES.CONNECTED;

  // Graceful disconnect
  client.gracefulDisconnect = () => {
    messageQueue = [];
    subscriptions.clear();
    if (client.connected) {
      client.disconnect();
    }
  };

  // Get connection info
  client.getConnectionInfo = () => ({
    state: connectionState,
    connected: client.connected,
    reconnectAttempts,
    queuedMessages: messageQueue.length,
    activeSubscriptions: subscriptions.size
  });

  return client;
}

// Enhanced waitForConnection with better error handling
export function waitForConnection(client, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (client.connected) {
      resolve(client);
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error(`Connection timeout after ${timeout}ms`));
    }, timeout);

    const originalOnConnect = client.onConnect;
    client.onConnect = (frame) => {
      clearTimeout(timeoutId);
      if (originalOnConnect) originalOnConnect(frame);
      resolve(client);
    };

    const originalOnError = client.onStompError || client.onWebSocketError;
    const errorHandler = (error) => {
      clearTimeout(timeoutId);
      if (originalOnError) originalOnError(error);
      reject(new Error(`Connection failed: ${error.message || 'Unknown error'}`));
    };

    client.onStompError = errorHandler;
    client.onWebSocketError = errorHandler;
  });
}

// Utility to create a managed connection
export async function createManagedConnection(options = {}) {
  const client = createStompClient(options);
  
  try {
    client.activate();
    await waitForConnection(client, options.connectionTimeout);
    return client;
  } catch (error) {
    console.error("❌ Failed to establish connection:", error);
    client.deactivate();
    throw error;
  }
}

// Connection manager for multiple clients
export class ConnectionManager {
  constructor() {
    this.clients = new Map();
  }

  async createConnection(name, options = {}) {
    if (this.clients.has(name)) {
      console.warn(`⚠️ Connection '${name}' already exists`);
      return this.clients.get(name);
    }

    try {
      const client = await createManagedConnection(options);
      this.clients.set(name, client);
      return client;
    } catch (error) {
      console.error(`❌ Failed to create connection '${name}':`, error);
      throw error;
    }
  }

  getConnection(name) {
    return this.clients.get(name);
  }

  async closeConnection(name) {
    const client = this.clients.get(name);
    if (client) {
      client.gracefulDisconnect();
      this.clients.delete(name);
    }
  }

  closeAllConnections() {
    this.clients.forEach((client, name) => {
      client.gracefulDisconnect();
    });
    this.clients.clear();
  }

  getConnectionStatus() {
    const status = {};
    this.clients.forEach((client, name) => {
      status[name] = client.getConnectionInfo();
    });
    return status;
  }
}