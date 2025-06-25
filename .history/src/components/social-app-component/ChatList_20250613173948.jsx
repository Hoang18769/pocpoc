"use client";
import { usePathname } from "next/navigation";
import useChatList from "@/hooks/useChatList";
import { ChevronDown, ChevronUp, SearchIcon } from "lucide-react";
import ChatItem from "./ChatItem";
import Input from "../ui-components/Input";
import Avatar from "../ui-components/Avatar";
import { useEffect, useRef, useState } from "react";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const pathname = usePathname();
  const { chats, loading, error, markChatAsRead } = useChatList();
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const listRef = useRef(null);

  const isChatsPage = pathname === "/chats";

  // Khởi tạo unread counts từ danh sách chat ban đầu
  useEffect(() => {
    const initialCounts = {};
    chats.forEach(chat => {
      initialCounts[chat.chatId] = chat.notReadMessageCount || 0;
    });
    setUnreadCounts(initialCounts);
  }, [chats]);

  // Mở chế độ expanded nếu ở /chats
  useEffect(() => {
    if (isChatsPage) setExpanded(true);
  }, [isChatsPage]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chats]);

  const handleChatSelect = async (chat) => {
    // Cập nhật ngay lập tức UI
    setUnreadCounts(prev => ({
      ...prev,
      [chat.chatId]: 0
    }));

    // Gọi API đánh dấu đã đọc (nếu có)
    if (markChatAsRead) {
      await markChatAsRead(chat.chatId);
    }

    // Gọi callback cha với chatId và target
    onSelectChat(chat.chatId, chat.target);
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredChats = chats.filter((chat) =>
    `${chat.target.givenName} ${chat.target.familyName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Sắp xếp avatar không trùng trong mini mode
  const uniqueChats = [
    ...new Map(chats.map((chat) => [chat.target.userId, chat])).values(),
  ];

  // === Loading State ===
  if (loading) {
    return <div className="space-y-3 p-4 animate-pulse">...</div>;
  }

  // === Error State ===
  if (error) {
    return <div className="p-4 text-center text-sm text-destructive">...</div>;
  }

  // === Empty State ===
  if (chats.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">...</div>;
  }

  // === Mini Mode ===
  if (!expanded && !isChatsPage) {
    return (
      <div
        role="button"
        onClick={() => setExpanded(true)}
        className="w-[300px] max-w-md mx-auto flex items-center justify-between p-3 bg-background border rounded-full cursor-pointer hover:bg-accent"
      >
        {/* ... (giữ nguyên phần mini mode) ... */}
      </div>
    );
  }

  // === Expanded Mode ===
  return (
    <div className="w-full max-w-md mx-auto flex flex-col border rounded-lg overflow-hidden h-full">
      {/* Header và Search (giữ nguyên) */}

      {/* Danh sách chat */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto flex flex-col"
        style={{ maxHeight: isChatsPage ? "none" : "400px" }}
      >
        {filteredChats.length > 0 ? (
          [...filteredChats]
            .reverse()
            .map((chat) => (
              <ChatItem
                key={chat.chatId}
                chat={{
                  ...chat,
                  notReadMessageCount: unreadCounts[chat.chatId] || 0
                }}
                selected={selectedChatId === chat.chatId}
                onClick={() => handleChatSelect(chat)}
              />
            ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Không tìm thấy đoạn chat nào.
          </div>
        )}
      </div>
    </div>
  );
}