"use client";
import { useEffect, useState } from "react";
import ChatLayou
import ChatContent from "@/components/chat/ChatContent";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch chat list
  useEffect(() => {
    fetch("/v1/chat")
      .then((res) => res.json())
      .then((res) => setChats(res.data || []));
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!activeChat) return;
    fetch(`/v1/message/${activeChat.id}`)
      .then((res) => res.json())
      .then((res) => setMessages(res.data || []));
  }, [activeChat]);

  const handleSendMessage = (text) => {
    const newMsg = {
      senderId: activeChat.selfId, // giả định đã biết selfId từ chat object
      content: text,
    };
    setMessages((prev) => [...prev, newMsg]);

    // Gửi message lên server (sau này thay bằng WebSocket)
    fetch(`/v1/message/${activeChat.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
  };

  return (
    <ChatLayout
      chatList={
        <>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-2 rounded cursor-pointer ${
                activeChat?.id === chat.id ? "bg-gray-800" : ""
              }`}
              onClick={() => setActiveChat(chat)}
            >
              {chat.otherUsername}
            </div>
          ))}
        </>
      }
      chatContent={
        activeChat ? (
          <ChatContent
            currentChat={activeChat}
            messages={messages}
            onSend={handleSendMessage}
            fullMode={true}
          />
        ) : (
          <div className="text-muted-foreground mt-10 text-center">Chọn cuộc trò chuyện để bắt đầu</div>
        )
      }
    />
  );
}
