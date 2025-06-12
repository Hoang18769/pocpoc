"use client";

import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";
import { useState } from "react";

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState(null);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black text-white divide-x divide-gray-800">
      {/* Sidebar - Chat list */}
      <div>

      <aside className="w-[30%] p-4 overflow-y-auto">
        <div className="text-xl font-semibold mb-4 px-2">Tin nhắn</div>
        <ChatList onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
      </aside>
      </div>

      {/* Main content - Chat box */}
      <main className="w-[70%] p-4 flex flex-col overflow-y-auto">
        {selectedChatId ? (
          <ChatBox chatId={selectedChatId} />
        ) : (
          <div className="flex items-center justify-center">

          <p className="text-muted-foreground">Chọn một đoạn chat để bắt đầu.</p>
          </div>
        )}
      </main>
    </div>
  );
}
