"use client";

import { useState } from "react";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [chatListKey, setChatListKey] = useState(0); // Key để force re-render ChatList

  // Xử lý khi chọn chat từ danh sách
  const handleSelectChat = (chatId, user) => {
    setSelectedChatId(chatId);
    setTargetUser(user);
  };

  // Xử lý khi bắt đầu chat mới (từ ProfilePage)
  const handleStartNewChat = (user) => {
    setSelectedChatId(null); // Không có chatId - đây là chat mới
    setTargetUser(user);
  };

  // Callback khi tạo chat mới thành công
  const handleChatCreated = (newChatId, user) => {
    console.log("🎉 Chat mới được tạo:", { newChatId, user });
    
    // Cập nhật chatId hiện tại
    setSelectedChatId(newChatId);
    
    // Force re-render ChatList để load danh sách chat mới
    setChatListKey(prev => prev + 1);
  };

  // Xử lý khi quay lại danh sách (mobile responsive)
  const handleBackToList = () => {
    setSelectedChatId(null);
    setTargetUser(null);
  };

  return (
    <div className="pt-16 flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 p-2 sm:p-4 gap-4">
      {/* Sidebar Chat List */}
      <aside className="w-full sm:w-[280px] md:w-[300px] lg:w-[340px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 overflow-y-auto shadow-sm">
        <ChatList
          key={chatListKey} // Key để force re-render khi có chat mới
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </aside>

      {/* Main Chat Box */}
      <main className="flex-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-y-auto shadow-sm">
        {targetUser ? (
          <ChatBox 
            chatId={selectedChatId} // Có thể null cho chat mới
            targetUser={targetUser} 
            onBack={handleBackToList}
            onChatCreated={handleChatCreated} // Callback khi tạo chat mới
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
            
            {/* Icon hoặc illustration có thể thêm ở đây */}
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
        ) : (
         
        )}
      </main>
    </div>
  );
}