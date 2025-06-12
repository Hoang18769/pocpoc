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
    <div className=" pt-16 flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 p-2 sm:p-4 gap-4">
      {/* Sidebar Chat List */}
      <aside className="w-full sm:w-[280px] md:w-[300px] lg:w-[340px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 lg:p-6 overflow-y-auto shadow-sm">
        <div className="text-lg font-semibold mb-4 px-2">Tin nhắn</div>
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </aside>

      {/* Main Chat Box */}
      <main className="flex-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 lg:p-6 overflow-y-auto shadow-sm">
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
