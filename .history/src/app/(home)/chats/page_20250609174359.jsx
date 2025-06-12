"use client";

import { useEffect, useState } from "react";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch chat list
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("/v1/chat");
        const json = await res.json();
        setChats(json.data || []);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };
    fetchChats();
  }, []);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/v1/message/${activeChat.id}`);
        const json = await res.json();
        setMessages(json.data || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [activeChat]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    const newMsg = { senderId: activeChat.selfId, content: text };
    setMessages((prev) => [...prev, newMsg]);

    await fetch(`/v1/message/${activeChat.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
  };

  return (
    <>
      {/* ChatList component (rendered in left sidebar of layout via DOM portal) */}
      <ChatList chats={chats} activeChat={activeChat} onSelect={setActiveChat} />

      {/* ChatBox (rendered in <main> via children) */}
      {activeChat ? (
        <ChatBox
          currentChat={activeChat}
          messages={messages}
          onSend={handleSendMessage}
          fullMode
        />
      ) : (
        <div className="text-muted-foreground mt-10 text-center">
          Chọn một cuộc trò chuyện để bắt đầu
        </div>
      )}
    </>
  );
}
