import { useEffect, useState } from "react";
import api from "@/utils/axios";
import useMessageSocket from "@/hooks/useMessageSocket";

export default function ChatBox({ chat }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await api.get(`/v1/messages/${chat.id}`);
      setMessages(res.data.body || []);
    };

    fetchMessages();
  }, [chat.id]);

  useMessageSocket(chat.id, {
    onMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded ${
              msg.fromSelf ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"
            } max-w-xs`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        {/* form nhập và gửi tin nhắn */}
      </div>
    </div>
  );
}
