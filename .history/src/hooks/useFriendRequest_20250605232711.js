import { useEffect, useState } from "react";
import axios from "@/lib/axios"; // hoặc fetch wrapper của bạn
import api from "@/utils/axios";

export default function useFriendRequests() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const [sentRes, receivedRes] = await Promise.all([
        api.get("/v1/friend-request/sent-requests"),
        api.get("/v1/friend-request/received-requests"),
      ]);

      setSent(sentRes.data.data.content);
      setReceived(receivedRes.data.data.content);
    };

    fetchRequests();
  }, []);

  return { sent, received };
}
