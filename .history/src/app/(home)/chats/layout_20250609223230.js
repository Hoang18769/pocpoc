"use client";

import { useEffect, useState } from "react";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox"; // Component sẽ hiển thị tin nhắn
import axios from "@/lib/axios";

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Gọi API để lấy tin nhắn mỗi khi chatId thay đổi
  useEffect(() => {
    if (!selectedChatId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/v1/messages?chatId=${selectedChatId}`);
        setMessages(res.data.body); // Giả sử backend trả về trong `body`
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn:", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black text-white divide-x divide-gray-800">
      {/* Sidebar */}
      <aside className="w-[30%] p-4 overflow-y-auto">
        <div className="text-xl font-semibold mb-4 px-2">Tin nhắn</div>
        <ChatList
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </aside>

      {/* Main content */}
      <main className="w-[70%] p-4 flex flex-col overflow-y-auto">
        {selectedChatId ? (
          <ChatBox chatId={selectedChatId} messages={messages} />
        ) : (
          <div className="text-muted-foreground text-center mt-10">
            Chọn một đoạn chat để bắt đầu trò chuyện
          </div>
        )}
      </main>
    </div>
  );
}
