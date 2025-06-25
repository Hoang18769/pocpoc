"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";
import useAppStore from "@/store/ZustandStore";

export default function ChatLayout() {
  const searchParams = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [chatListKey, setChatListKey] = useState(0);

  const selectedFromStore = useAppStore((state) => state.selectedChat);
  const virtualFromStore = useAppStore((state) => state.virtualChat);

  // ✅ Ưu tiên Zustand store trước, fallback query params
 // Thêm console.log vào useEffect của ChatLayout
useEffect(() => {
  console.log("🔍 ChatLayout useEffect triggered");
  console.log("📊 Store states:", { selectedFromStore, virtualFromStore });
  console.log("🔗 Query params:", {
    chatId: searchParams.get("chatId"),
    newChat: searchParams.get("newChat"),
    userId: searchParams.get("userId")
  });

  // Kiểm tra store trước
  if (selectedFromStore) {
    console.log("✅ Using selectedFromStore:", selectedFromStore);
    setSelectedChatId(selectedFromStore.chatId);
    setTargetUser(selectedFromStore.user);
    return;
  }
  
  if (virtualFromStore) {
    console.log("✅ Using virtualFromStore:", virtualFromStore);
    setSelectedChatId(null);
    setTargetUser(virtualFromStore.user);
    return;
  }

  // Fallback query params
  const chatId = searchParams.get("chatId");
  const newChat = searchParams.get("newChat");
  const userId = searchParams.get("userId");
  const username = searchParams.get("username");
  const displayName = searchParams.get("displayName");

  if (chatId && userId) {
    console.log("✅ Using query params for existing chat");
    setSelectedChatId(chatId);
    setTargetUser({
      id: userId,
      username: username || "",
      displayName: displayName ? decodeURIComponent(displayName) : username || ""
    });
  } else if (newChat === "true" && userId && username) {
    console.log("✅ Using query params for new chat");
    setSelectedChatId(null);
    setTargetUser({
      id: userId,
      username,
      displayName: displayName ? decodeURIComponent(displayName) : username
    });
  } else {
    console.log("❌ No valid data found");
  }
}, [searchParams, selectedFromStore, virtualFromStore]);
  const handleSelectChat = (chatId, user) => {
    setSelectedChatId(chatId);
    setTargetUser(user);
  };

  const handleStartNewChat = (user) => {
    setSelectedChatId(null);
    setTargetUser(user);
  };

  const handleChatCreated = (newChatId, user) => {
    console.log("🎉 Chat mới được tạo:", { newChatId, user });
    setSelectedChatId(newChatId);
    setChatListKey((prev) => prev + 1);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setTargetUser(null);
  };

  return (
    <div className="pt-16 flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 p-2 sm:p-4 gap-4">
      {/* Sidebar Chat List */}
      <aside className="w-full sm:w-[280px] md:w-[300px] lg:w-[340px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 overflow-y-auto shadow-sm">
        <ChatList
          key={chatListKey}
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </aside>

      {/* Main Chat Box */}
      <main className="flex-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-y-auto shadow-sm">
        {targetUser ? (
          <ChatBox
            chatId={selectedChatId}
            targetUser={targetUser}
            onBack={handleBackToList}
            onChatCreated={handleChatCreated}
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
              <svg
                className="w-12 h-12 text-[var(--muted-foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}