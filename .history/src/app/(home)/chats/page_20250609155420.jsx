"use client";

import { useEffect, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatWindow from "@/components/ChatWindow";

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

  const chatList = chats.map((chat) => (
    <div
      key={chat.id}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
        activeChat?.id === chat.id ? "bg-gray-800" : "hover:bg-gray-900"
      }`}
      onClick={() => setActiveChat(chat)}
    >
      <img
        src={chat.avatar || "/default-avatar.png"}
        alt="avatar"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <div className="font-medium text-white">{chat.otherUsername}</div>
        <div className="text-sm text-gray-400 truncate max-w-[180px]">
          {chat.lastMessage?.content || "Bắt đầu cuộc trò chuyện"}
        </div>
      </div>
    </div>
  ));

  const chatContent = activeChat ? (
    <ChatWindow currentChat={activeChat} />
  ) : (
    <div className="text-gray-500 text-lg text-center my-auto">
      Hãy chọn một đoạn chat để bắt đầu
    </div>
  );

  return <ChatLayout chatList={chatList} chatContent={chatContent} />;
}
