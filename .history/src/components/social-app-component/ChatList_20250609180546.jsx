import { useEffect, useState } from "react";
import api from "@/utils/axios";
import useChatSocket from "@/hooks/useChatSocket";

export default function ChatList({ onSelectChat, selectedChat }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/v1/chats");
        setChats(res.data.body || []);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, []);

  useChatSocket({
    onNewMessage: (message) => {
      // Cập nhật danh sách chat khi có tin nhắn mới
      setChats((prev) => {
        const updated = prev.map(chat =>
          chat.id === message.chatId
            ? { ...chat, lastMessage: message, unreadCount: chat.unreadCount + 1 }
            : chat
        );
        return updated;
      });
    },
  });

  return (
    <ul>
      {chats.map((chat) => (
        <li
          key={chat.id}
          className={`p-4 cursor-pointer hover:bg-muted ${
            selectedChat?.id === chat.id ? "bg-muted" : ""
          }`}
          onClick={() => onSelectChat(chat)}
        >
          <div className="font-semibold">{chat.name}</div>
          <div className="text-sm text-muted-foreground truncate">
            {chat.lastMessage?.content}
          </div>
        </li>
      ))}
    </ul>
  );
}
