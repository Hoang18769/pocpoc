"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatList from "@/components/social-app-component/ChatList";
import ChatBox from "@/components/social-app-component/ChatBox";
import useAppStore from "@/store/ZustandStore";
import useIsMobile from "@/hooks/useIsMobile";

// Tách component sử dụng useSearchParams
function ChatLayoutContent() {
  const searchParams = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [chatListKey, setChatListKey] = useState(0);
  const isMobile = useIsMobile();

  const shouldShowChatList = !targetUser || !isMobile;
  const shouldShowChatBox = !!targetUser;

  const selectedChatId_Store = useAppStore((state) => state.selectedChatId);
  const virtualChatUser_Store = useAppStore((state) => state.virtualChatUser);
  const chatList = useAppStore((state) => state.chatList);
  const fetchChatList = useAppStore((state) => state.fetchChatList);
  const clearChatSelection = useAppStore((state) => state.clearChatSelection);

  useEffect(() => {
    console.log("🔍 ChatLayout useEffect:");
    console.log("📊 Store selectedChatId:", selectedChatId_Store);
    console.log("📊 Store virtualChatUser:", virtualChatUser_Store);

    if (selectedChatId_Store) {
      console.log("✅ Using selectedChatId from store");
      const selectedChat = chatList.find(chat =>
        chat.chatId === selectedChatId_Store || chat.id === selectedChatId_Store
      );
      if (selectedChat) {
        setSelectedChatId(selectedChatId_Store);
        setTargetUser(selectedChat.target);
        return;
      }
    }

    if (virtualChatUser_Store) {
      console.log("✅ Using virtualChatUser from store");
      setSelectedChatId(null);
      setTargetUser(virtualChatUser_Store);
      return;
    }

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
  }, [searchParams, selectedChatId_Store, virtualChatUser_Store, chatList]);

  const handleSelectChat = (chatId, user) => {
    setSelectedChatId(chatId);
    setTargetUser(user);
  };

  const handleStartNewChat = (user) => {
    setSelectedChatId(null);
    setTargetUser(user);
  };

  const handleChatCreated = async (newChatId, user) => {
    console.log("🎉 Chat mới được tạo:", { newChatId, user });
    try {
      await fetchChatList();
      setSelectedChatId(newChatId);
      setTargetUser(user);
      setChatListKey((prev) => prev + 1);
      console.log("✅ Chat creation flow completed successfully");
    } catch (error) {
      console.error("❌ Error in chat creation flow:", error);
    }
  };

  const handleBackToList = () => {
    clearChatSelection();
    setSelectedChatId(null);
    setTargetUser(null);
  };

  return (
    <div className="pt-16 flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 p-2 sm:p-4 gap-4">
      {/* ChatList - hiển thị nếu mobile chưa chọn user, hoặc luôn hiện trên màn lớn */}
      {shouldShowChatList && (
        <aside className="w-full sm:w-[15%] md:w-[40%] lg:w-[340px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-2 md:p-4 overflow-y-auto shadow-sm">
          <ChatList
            key={chatListKey}
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChatId}
          />
        </aside>
      )}

      {/* ChatBox - hiển thị nếu đã chọn user */}
      {shouldShowChatBox && (
        <main className="flex-1 sm:w-[85%] md:w-[60%] rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-y-auto shadow-sm">
          <ChatBox
            chatId={selectedChatId}
            targetUser={targetUser}
            onBack={handleBackToList}
            onChatCreated={handleChatCreated}
          />
        </main>
      )}
    </div>
  );
}

// Component chính với Suspense wrapper
export default function ChatLayout() {
  return (
    <Suspense fallback={
      <div className="pt-16 flex h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--foreground)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatLayoutContent />
    </Suspense>
  );
}