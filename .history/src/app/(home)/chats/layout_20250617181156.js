"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";
import useAppStore from "@/stores/useAppStore";

export default function ChatLayout() {
  const searchParams = useSearchParams();

  // Zustand store state
  const {
    selectedChatId,
    virtualChatUser,
    selectChat,
    showVirtualChat,
    clearChatSelection,
    getChatByUserId
  } = useAppStore();

  // Handle URL parameters on mount
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    const newChat = searchParams.get('newChat');
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const displayName = searchParams.get('displayName');

    if (newChat === 'true' && userId && username) {
      const user = {
        id: userId,
        username,
        displayName: displayName ? decodeURIComponent(displayName) : username
      };
      showVirtualChat(userId, user);
    } else if (chatId && userId) {
      selectChat(chatId);
    }
  }, [searchParams]);

  const handleSelectChat = (chatId, user) => {
    selectChat(chatId);
  };

  const handleBackToList = () => {
    clearChatSelection();
  };

  return (
    <div className="pt-16 flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 p-2 sm:p-4 gap-4">
      {/* Sidebar Chat List */}
      <aside className="w-full sm:w-[280px] md:w-[300px] lg:w-[340px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 overflow-y-auto shadow-sm">
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </aside>

      {/* Main Chat Box */}
      <main className="flex-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-y-auto shadow-sm">
        {virtualChatUser ? (
          <ChatBox 
            chatId={null}
            targetUser={virtualChatUser}
            onBack={handleBackToList}
          />
        ) : selectedChatId ? (
          <ChatBox 
            chatId={selectedChatId}
            targetUser={null}
            onBack={handleBackToList}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                Chào mừng đến với Chat
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Chọn một đoạn chat để bắt đầu trò chuyện
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                hoặc tìm kiếm người dùng để bắt đầu cuộc trò chuyện mới
              </p>
            </div>
            <div className="w-24 h-24 rounded-full bg-[var(--muted)] opacity-20 flex items-center justify-center">
              <svg className="w-12 h-12 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
