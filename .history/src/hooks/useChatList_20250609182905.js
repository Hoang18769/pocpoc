// src/hooks/useChatList.js hoặc .ts
import { useEffect, useState } from "react";
import api from "@/lib/api"; // hoặc đường dẫn đến Axios instance

export default function useChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchChats() {
      try {
        const res = await api.get("/v1/chat");
        if (isMounted) {
          setChats(res.data.data); // API của bạn trả về { data: [...] }
        }
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
