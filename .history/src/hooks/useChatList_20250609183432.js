// src/hooks/useChatList.js hoặc .ts
import { useEffect, useState } from "react";
import api from "@/utils/axios";

export default function useChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    async function fetchChats() {
      try {
        const res = await api.get("/v1/chat");
          setChats(res.data.body);
          console.log("res",res) 
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchChats();

    return () => {
      isMounted = false;
    };
  }, []);

  return { chats, loading, error };
}
