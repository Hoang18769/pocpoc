"use client";

import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";

export default function useNotificationSocket(userId) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("accessToken");
    const client = createStompClient(token); // lấy token mới nhất từ localStorage

    clientRef.current = client;

   setTimeout()

    client.onStompError = (frame) => {
      console.error(" STOMP error", frame);
    };

    client.activate();

    return () => {
      client.deactivate();
      console.log("Disconnected from WebSocket");
    };
  }, [userId]);
}
