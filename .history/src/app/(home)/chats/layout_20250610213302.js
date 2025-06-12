"use client";

import { useState } from "react";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [targetUser, setTargetUser] = useState(null);

  const handleSelectChat = (chatId, user) => {
    setSelectedChatId(chatId);
    setTargetUser(user);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      {/* Sidebar Chat List */}
      <aside className="w-full sm:w-[280px] md:w-[300px] lg:w-[340px] border-r border-[var(--border)] bg-[var(--card)] p-4 overflow-y-auto">
        <div className="text-lg font-semibold mb-4 px-2">Tin nhắn</div>
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </aside>

      {/* Main Chat Box */}
      <main className="flex-1 p-4 flex flex-col overflow-y-auto">
        {selectedChatId ? (
          <ChatBox chatId={selectedChatId} targetUser={targetUser} />
        ) : (
          <div className="text-center text-sm text-[var(--muted-foreground)] mt-10">
            Chọn một đoạn chat để bắt đầu trò chuyện
          </div>
        )}
      </main>
    </div>
  );
}
