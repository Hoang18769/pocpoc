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
  const listRef = useRef(null);

  const isChatsPage = pathname === "/chats";

  // Mở chế độ expanded nếu ở /chats
  useEffect(() => {
    if (isChatsPage) setExpanded(true);
  }, [isChatsPage]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chats]);

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

  const handleChatSelect = (chat) => {
    // Tạo bản sao của chat với notReadMessageCount = 0
    const updatedChat = {
      ...chat,
      notReadMessageCount: 0
    };
    
    // Gọi hàm markChatAsRead nếu có
    if (markChatAsRead) {
      markChatAsRead(chat.chatId);
    }
    
    // Gọi callback với chat đã cập nhật
    onSelectChat(updatedChat.chatId, updatedChat.target);
  };

  // === Loading State ===
  if (loading) {
    return (
      <div className="space-y-3 p-4 animate-pulse">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="h-10 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  // === Error State ===
  if (error) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        Đã xảy ra lỗi khi tải tin nhắn.
      </div>
    );
  }

  // === Empty State ===
  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Không có đoạn chat nào.
      </div>
    );
  }

  // === Mini Mode ===
  if (!expanded && !isChatsPage) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-expanded="false"
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(true)}
        className="w-[300px] max-w-md mx-auto flex items-center justify-between p-3 bg-background border rounded-full cursor-pointer hover:bg-accent"
      >
        <div className="flex -space-x-2">
          {uniqueChats.slice(0, 3).map((chat, index) => (
            <div key={index} className="relative">
              <Avatar
                src={chat.target.profilePictureUrl}
                alt={`${chat.target.givenName} ${chat.target.familyName}`}
                size="sm"
              />
              {chat.target.online && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-background rounded-full" />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {chats.length > 3
              ? `+${chats.length - 3} tin nhắn`
              : `${chats.length} tin nhắn`}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // === Expanded Mode ===
  return (
    <div className="w-full max-w-md mx-auto flex flex-col border rounded-lg overflow-hidden h-full">
      {/* Header với nút thu gọn (ẩn khi ở /chats) */}
      {!isChatsPage && (
        <div className="flex items-center justify-between p-3 bg-background border-b">
          <h3 className="font-medium">Tin nhắn</h3>
          <button
            onClick={() => setExpanded(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Thanh tìm kiếm */}
      <div className="flex items-center bg-background px-3 py-2 border-b">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm đoạn chat..."
          className="w-full bg-transparent border-none focus-visible:ring-0 pl-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
                chat={chat}
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