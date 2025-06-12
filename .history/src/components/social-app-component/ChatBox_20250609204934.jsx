import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function ChatBox({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/v1/messages/history/${chatId}?page=0&size=20`);
        setMessages(res.data.body); // tuỳ theo response shape
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  if (loading) return <p>Đang tải tin nhắn...</p>;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className="text-sm">
          <strong>{msg.sender.givenName}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}
