"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";
import useAppStore from "@/store/ZustandStore";

export default function ChatLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedChatId = useAppStore((state) => state.selectedChatId);
  const virtualChatUser = useAppStore((state) => state.virtualChatUser);
  const getSelectedChat = useAppStore((state) => state.getSelectedChat);
  const clearChatSelection = useAppStore((state) => state.clearChatSelection);
  const selectChat = useAppStore((state) => state.selectChat);
  const showVirtualChat = useAppStore((state) => state.showVirtualChat);
  const chatList = useAppStore((state) => state.chatList);
  const getUserByChatId = useAppStore((state) => state.getUserByChatId);

  const [targetUser, setTargetUser] = useState(null);
  const [chatListKey, setChatListKey] = useState(0);
  const [userId, setUserId] = useState(null);

  // Lấy userId từ localStorage sau khi mounted (client only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId"));
    }
  }, []);

  // Xử lý navigation từ ProfileHeader
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    const type = searchParams.get('type');
    const targetUserId = searchParams.get('userId');
    const username = searchParams.get('username');
    const displayName = searchParams.get('displayName');

    if (chatId && type === 'existing' && targetUserId) {
      // Kiểm tra xem chat có tồn tại trong store không
      const existingChat = chatList.find(chat => chat.id === chatId);
      
      if (existingChat) {
        console.log(`🚀 Opening existing chat: ${chatId}`);
        selectChat(chatId);
        
        // Tìm target user từ participants
        if (userId) {
          const otherUser = existingChat.participants?.find(p => p.id !== userId);
          if (otherUser) {
            setTargetUser({
              id: otherUser.id,
              username: otherUser.username,
              displayName: otherUser.displayName || otherUser.username,
            });
          }
        }
        
        // Clear URL params sau khi xử lý
        router.replace('/chat', { scroll: false });
      } else {
        // Nếu chat không tồn tại trong store, tạo virtual chat
        console.log(`🚀 Creating virtual chat with user: ${targetUserId}`);
        showVirtualChat(targetUserId, {
          username: username,
          displayName: displayName || username
        });
        
        // Clear URL params sau khi xử lý
        router.replace('/chat', { scroll: false });
      }
    } else if (type === 'virtual' && targetUserId) {
      // Xử lý virtual chat
      console.log(`🚀 Creating virtual chat with user: ${targetUserId}`);
      showVirtualChat(targetUserId, {
        username: username,
        displayName: displayName || username
      });
      
      // Clear URL params sau khi xử lý
      router.replace('/chat', { scroll: false });
    }
  }, [searchParams, chatList, userId, selectChat, showVirtualChat, router]);

  // Đồng bộ targetUser khi chatId hoặc virtualChatUser thay đổi
  useEffect(() => {
    if (selectedChatId && userId) {
      const selectedChat = getSelectedChat();
      if (selectedChat) {
        const otherUser = selectedChat.participants?.find((p) => p.id !== userId);
        if (otherUser) {
          setTargetUser({
            id: otherUser.id,
            username: otherUser.username,
            displayName: otherUser.displayName || otherUser.username,
          });
        }
      }
    } else if (virtualChatUser) {
      setTargetUser({
        id: virtualChatUser.id,
        username: virtualChatUser.username,
        displayName: virtualChatUser.displayName || virtualChatUser.username,
      });
    } else {
      setTargetUser(null);
    }
  }, [selectedChatId, virtualChatUser, userId, getSelectedChat]);

  const handleSelectChat = (chatId, user) => {
    selectChat(chatId);
    setTargetUser(user);
  };

  const handleChatCreated = (newChatId, user) => {
    selectChat(newChatId);
    setTargetUser(user);
    setChatListKey((prev) => prev + 1);
  };

  const handleBackToList = () => {
    clearChatSelection();
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