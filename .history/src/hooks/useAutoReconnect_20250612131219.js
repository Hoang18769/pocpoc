// hooks/useAutoReconnectStomp.js
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import { setOnTokenRefreshedCallback } from "@/utils/axios";

export function useAutoReconnectStomp({ onConnect, onDisconnect }) {
  const clientRef = useRef(null);

  useEffect(() => {
    let client = createStompClient(onConnect);
    clientRef.current = client;
    client.activate();

    setOnTokenRefreshedCallback(() => {
      console.log("🔁 Token refreshed, reconnecting STOMP client...");
      if (clientRef.current) {
        clientRef.current.deactivate().then(() => {
          client = createStompClient(onConnect);
          clientRef.current = client;
          client.activate();
        });
      }
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [onConnect]);

  return clientRef;
}
