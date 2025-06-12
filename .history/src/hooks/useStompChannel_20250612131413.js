// hooks/useStompChannel.js
"use client";
import { useEffect, useRef } from "react";
import { useAutoReconnectStomp } from "./useAutoReconnectStomp";

export function useStompChannel(destination, onMessage) {
  const clientRef = useAutoReconnectStomp();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!clientRef.current || !destination) return;

    const subscribe = () => {
      if (subscriptionRef.current) return;
      subscriptionRef.current = clientRef.current.subscribe(destination, (msg) => {
        try {
          const data = JSON.parse(msg.body);
          onMessage?.(data);
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      });
    };

    if (clientRef.current.connected) {
      subscribe();
    } else {
      // Nếu chưa connected, đợi tới khi connected rồi mới subscribe
      clientRef.current.onConnect = () => {
        subscribe();
      };
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [clientRef.current, destination]);
}
