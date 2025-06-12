import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAuthToken, isTokenValid } from "./axios";

export function createStompClient(onConnect) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost/ws"),
    connectHeaders: {
      Authorization: "Bearer " + (getAuthToken() || ""),
    },
    debug: (str) => console.log("[STOMP DEBUG]", str),
    reconnectDelay: 5000,
    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);
      // Process any pending subscriptions after connection
      if (client._pendingSubscriptions) {
        client._pendingSubscriptions.forEach(({ destination, callback, headers }) => {
          console.log("📡 Processing pending subscription:", destination);
          client.subscribe(destination, callback, headers);
        });
        client._pendingSubscriptions = [];
      }
      // Call the original onConnect callback
      if (onConnect) onConnect(frame);
    },
    onDisconnect: () => {
      console.warn("⚠️ STOMP disconnected");
      // Reset pending subscriptions on disconnect
      client._pendingSubscriptions = [];
    },
    onWebSocketClose: () => console.warn("⚠️ WebSocket closed"),
    onWebSocketError: (event) => console.error("❌ WebSocket error:", event),
    beforeConnect: async () => {
      const token = getAuthToken();
      if (!token || !isTokenValid()) {
        console.log("🔄 Token expired or missing, waiting for refresh...");
        await new Promise((r) => setTimeout(r, 500));
      }
      client.connectHeaders = {
        Authorization: "Bearer " + (getAuthToken() || ""),
      };
    },
  });

  // Initialize pending subscriptions array
  client._pendingSubscriptions = [];

  // Enhanced sendMessage method
  client.sendMessage = (destination, message, headers = {}) => {
    if (!client.connected) {
      console.error("❌ Client not connected. Cannot send message.");
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
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  };

  // Enhanced subscribeToChannel method with queuing
  client.subscribeToChannel = (destination, callback, headers = {}) => {
    if (!client.connected) {
      console.log("⏳ Client not connected yet. Queuing subscription for:", destination);
      // Queue the subscription to be processed when connected
      client._pendingSubscriptions.push({ destination, callback, headers });
      return null;
    }

    try {
      return client.subscribe(destination, callback, headers);
    } catch (error) {
      console.error("❌ Error subscribing to channel:", error);
      return null;
    }
  };

  // Method to check connection status
  client.isConnected = () => client.connected;

  // Method to force connection if not connected
  client.ensureConnection = async (timeout = 5000) => {
    if (client.connected) {
      return Promise.resolve(client);
    }

    if (!client.active) {
      client.activate();
    }

    return waitForConnection(client, timeout);
  };

  return client;
}

// Enhanced helper function to wait for connection
export function waitForConnection(client, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (client.connected) {
      resolve(client);
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Connection timeout"));
    }, timeout);

    const originalOnConnect = client.onConnect;
    client.onConnect = (frame) => {
      clearTimeout(timeoutId);
      if (originalOnConnect) originalOnConnect(frame);
      resolve(client);
    };

    // Start connection if not already active
    if (!client.active) {
      client.activate();
    }
  });
}

// Utility function to create and connect client in one go
export async function createAndConnectStompClient(onConnect, timeout = 5000) {
  const client = createStompClient(onConnect);
  
  try {
    client.activate();
    await waitForConnection(client, timeout);
    return client;
  } catch (error) {
    console.error("❌ Failed to connect STOMP client:", error);
    client.deactivate();
    throw error;
  }
}