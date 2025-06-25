import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid, onTokenRefresh } from "./axios";
import api from "./axios";

// Singleton instance
let stompClientInstance = null;
let isConnecting = false;
let connectionCallbacks = [];

// Connection Manager Class
class StompConnectionManager {
  constructor() {
    this.client = null;
    this.isConnecting = false;
    this.subscriptions = new Map(); // Track subscriptions
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async getClient(onConnect) {
    // Return existing connected client
    if (this.client && this.client.connected) {
      if (onConnect) onConnect();
      return this.client;
    }

    // Wait for ongoing connection
    if (this.isConnecting) {
      return new Promise((resolve) => {
        connectionCallbacks.push(resolve);
      });
    }

    // Create new connection
    return this.createConnection(onConnect);
  }

  async createConnection(onConnect) {
    this.isConnecting = true;
    
    try {
      // Cleanup old client
      if (this.client) {
        await this.client.deactivate();
        this.client = null;
      }

      console.log("🔌 Creating new STOMP client...");
      
      this.client = new Client({
        webSocketFactory: () => new SockJS("http://localhost/ws"),
        connectHeaders: {
          Authorization: "Bearer " + (getAuthToken() || ""),
        },
        debug: (str) => console.log("[STOMP DEBUG]", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: (frame) => {
          console.log("✅ STOMP connected", frame);
          this.reconnectAttempts = 0;
          
          // Resubscribe to all previous subscriptions
          this.resubscribeAll();
          
          if (onConnect) onConnect(frame);
          
          // Resolve waiting callbacks
          connectionCallbacks.forEach(callback => callback(this.client));
          connectionCallbacks = [];
        },
        
        onDisconnect: () => {
          console.warn("⚠️ STOMP disconnected");
          this.subscriptions.clear();
        },
        
        onWebSocketClose: () => {
          console.warn("⚠️ WebSocket closed");
          this.handleReconnect();
        },
        
        onWebSocketError: (event) => {
          console.error("❌ WebSocket error:", event);
          this.handleReconnect();
        },
        
        onStompError: (frame) => {
          console.error("❌ STOMP error:", frame.headers["message"] || frame.body);
          
          // Handle auth errors
          if (frame.headers["message"]?.includes("403") || frame.body?.includes("403")) {
            console.log("🔄 Token invalid. Will try to refresh and reconnect...");
            this.reconnectWithNewToken();
          }
        },
        
        beforeConnect: async () => {
          let token = getAuthToken();
          if (!token || !isTokenValid()) {
            console.log("🔄 Getting valid token...");
            token = await this.waitForValidTokenWithFallback();
          }
          this.client.connectHeaders = {
            Authorization: "Bearer " + (token || ""),
          };
        },
      });

      // Add custom methods
      this.addClientMethods();
      
      // Activate connection
      this.client.activate();
      
      return this.client;
      
    } catch (error) {
      console.error("❌ Failed to create STOMP connection:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  addClientMethods() {
    // Send message method
    this.client.sendMessage = (destination, message, headers = {}) => {
      if (!this.client.connected) {
        console.error("❌ Client not connected. Cannot send message.");
        return false;
      }
      try {
        this.client.publish({
          destination,
          body: JSON.stringify(message),
          headers: {
            'content-type': 'application/json',
            ...headers,
          },
        });
        return true;
      } catch (error) {
        console.error("❌ Error sending message:", error);
        return false;
      }
    };

    // Enhanced subscribe method
    this.client.subscribeToChannel = (destination, callback, headers = {}) => {
      if (!this.client.connected) {
        console.error("❌ Client not connected. Cannot subscribe.");
        return null;
      }
      
      const subscription = this.client.subscribe(destination, callback, headers);
      
      // Store subscription for resubscription
      this.subscriptions.set(destination, { callback, headers });
      
      return subscription;
    };
  }

  // Resubscribe to all channels after reconnection
  resubscribeAll() {
    console.log("🔄 Resubscribing to all channels...");
    this.subscriptions.forEach(({ callback, headers }, destination) => {
      try {
        this.client.subscribe(destination, callback, headers);
        console.log(`✅ Re-subscribed to ${destination}`);
      } catch (error) {
        console.error(`❌ Failed to re-subscribe to ${destination}:`, error);
      }
    });
  }

  // Handle reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.client?.connected) {
        this.createConnection();
      }
    }, delay);
  }

  // Reconnect with refreshed token
  async reconnectWithNewToken() {
    try {
      const token = await this.waitForValidTokenWithFallback();
      if (this.client) {
        this.client.connectHeaders = {
          Authorization: "Bearer " + token,
        };
        await this.client.deactivate();
        this.client.activate();
      }
    } catch (err) {
      console.error("❌ Failed to refresh token and reconnect:", err);
    }
  }

  // Disconnect and cleanup
  disconnect() {
    console.log("🔌 Disconnecting STOMP client...");
    
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
    connectionCallbacks = [];
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.client?.connected || false,
      connecting: this.isConnecting,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Wait for valid token with fallback
  async waitForValidTokenWithFallback(timeout = 3000) {
    return Promise.race([
      // Event-based approach
      new Promise((resolve, reject) => {
        const token = getAuthToken();
        if (token && isTokenValid()) {
          return resolve(token);
        }

        const unsubscribe = onTokenRefresh((newToken) => {
          if (newToken && isTokenValid()) {
            unsubscribe();
            resolve(newToken);
          }
        });

        setTimeout(() => {
          unsubscribe();
          reject(new Error("Token event timeout"));
        }, timeout);
      }),
      
      // Force refresh approach
      (async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.forceGetValidToken();
      })()
    ]);
  }

  // Force get valid token
  async forceGetValidToken(maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const token = getAuthToken();
        
        if (token && isTokenValid()) {
          console.log("✅ Token is valid");
          return token;
        }
        
        console.log(`🔄 Triggering token refresh (attempt ${retries + 1}/${maxRetries})`);
        
        try {
          await api.get('/v1/auth/validate');
        } catch (error) {
          if (error.response?.status === 401) {
            console.log("🔄 Token refresh triggered by 401 response");
          }
        }
        
        const newToken = getAuthToken();
        if (newToken && isTokenValid()) {
          console.log("✅ Token refreshed successfully");
          return newToken;
        }
        
        throw new Error("Failed to get valid token after refresh attempt");
        
      } catch (error) {
        retries++;
        console.error(`❌ Token refresh attempt ${retries} failed:`, error);
        
        if (retries >= maxRetries) {
          console.error("❌ Max retries reached. Session may be expired.");
          throw new Error("Unable to get valid token after multiple attempts");
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }
}

// Singleton instance
const stompManager = new StompConnectionManager();

// Public API
export async function getStompClient(onConnect) {
  return stompManager.getClient(onConnect);
}

export function disconnectStompClient() {
  stompManager.disconnect();
}

export function getStompClientStatus() {
  return stompManager.getStatus();
}

// Legacy support - deprecated
export function createStompClient(onConnect) {
  console.warn("⚠️ createStompClient is deprecated. Use getStompClient instead.");
  return getStompClient(onConnect);
}