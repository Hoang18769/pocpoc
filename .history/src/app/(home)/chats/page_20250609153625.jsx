// src/app/chat/page.jsx
"use client";
import { useEffect, useState } from "react";
import ChatWindo

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    fetch("/v1/chat")
      .then((res) => res.json())
      .then((res) => {
        setChats(res.data || []);
      });
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-[300px] border-r p-2 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">Tin nhắn</h2>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 rounded cursor-pointer ${
              activeChat?.id === chat.id ? "bg-blue-100" : ""
            }`}
            onClick={() => setActiveChat(chat)}
          >
            {chat.otherUsername}
          </div>
        ))}
      </div>

      <div className="flex-1">{activeChat && <ChatWindow currentChat={activeChat} />}</div>
    </div>
  );
}
