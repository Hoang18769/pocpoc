"use client";

import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";
import useAppStore from "@/store/ZustandStore";

export default function ChatLayout() {
  const selectedChat = useAppStore((state) => state.selectedChat);
  const virtualChat = useAppStore((state) => state.virtualChat);
  const chatList = useAppStore((state) => state.chatList);
  const selectChat = useAppStore((state) => state.selectChat);
  const clearChatSelection = useAppStore((state) => state.clearChatSelection);

  const getCurrentUserId = () =>
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const targetChat = selectedChat
    ? selectedChat
    : virtualChat
    ? { chatId: null, user: virtualChat.user }
    : null;

  const chat = chatList.find((c) => c.id === targetChat?.chatId);
  const fallbackUser =
    chat?.participants?.find((p) => p.id !== getCurrentUserId()) || null;

  const targetUser = targetChat?.user || fallbackUser;

  const handleSelectChat = (chatId, user) => {
    selectChat(chatId, user);
  };

  return (
    <div className="pt-16 flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 p-2 sm:p-4 gap-4">
      {/* Sidebar Chat List */}
      <aside className="w-full sm:w-[280px] md:w-[300px] lg:w-[340px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 overflow-y-auto shadow-sm">
        <ChatList
          selectedChatId={targetChat?.chatId || null}
          onSelectChat={handleSelectChat}
        />
      </aside>

      {/* Main Chat Box */}
      <main className="flex-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-y-auto shadow-sm">
        {targetUser ? (
          <ChatBox
            chatId={targetChat?.chatId}
            targetUser={targetUser}
            onBack={clearChatSelection}
            onChatCreated={(newChatId, user) => {
              // Khi tạo chat mới từ ChatBox, cập nhật lại trạng thái
              selectChat(newChatId, user);
            }}
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
