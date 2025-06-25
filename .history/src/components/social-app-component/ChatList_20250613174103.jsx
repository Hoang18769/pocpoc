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

  // Initialize unread counts
  useEffect(() => {
    const counts = {};
    chats.forEach(chat => {
      counts[chat.chatId] = chat.notReadMessageCount || 0;
    });
    setUnreadCounts(counts);
  }, [chats]);

  // Auto-expand on chats page
  useEffect(() => {
    if (isChatsPage) setExpanded(true);
  }, [isChatsPage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chats]);

  const handleChatSelect = async (chat) => {
    // Immediate UI update
    setUnreadCounts(prev => ({
      ...prev,
      [chat.chatId]: 0
    }));

    // Mark as read in backend
    try {
      if (markChatAsRead) {
        await markChatAsRead(chat.chatId);
      }
    } catch (err) {
      console.error("Failed to mark chat as read:", err);
      // Rollback UI if API fails
      setUnreadCounts(prev => ({
        ...prev,
        [chat.chatId]: chat.notReadMessageCount || 0
      }));
      return;
    }

    // Notify parent component
    onSelectChat(chat.chatId, chat.target);
  };

  const filteredChats = chats.filter(chat =>
    `${chat.target.givenName} ${chat.target.familyName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const uniqueChats = [
    ...new Map(chats.map(chat => [chat.target.userId, chat])).values(),
  ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3 p-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        Failed to load chats. Please try again.
      </div>
    );
  }

  // Empty state
  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  // Collapsed mode (for non-/chats pages)
  if (!expanded && !isChatsPage) {
    return (
      <div
        role="button"
        onClick={() => setExpanded(true)}
        className="w-[300px] max-w-md mx-auto flex items-center justify-between p-3 bg-background border rounded-full cursor-pointer hover:bg-accent transition-colors"
      >
        <div className="flex -space-x-2">
          {uniqueChats.slice(0, 3).map((chat, i) => (
            <div key={i} className="relative">
              <Avatar
                src={chat.target.profilePictureUrl}
                alt={`${chat.target.givenName} ${chat.target.familyName}`}
                size="sm"
                className="border-2 border-background"
              />
              {chat.target.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-background" />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-muted-foreground">
            {chats.length > 3 ? `+${chats.length - 3} more` : `${chats.length} chats`}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Expanded mode
  return (
    <div className="w-full max-w-md mx-auto bg-background flex flex-col border rounded-lg overflow-hidden h-full shadow-sm">
      {!isChatsPage && (
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium text-sm">Messages</h3>
          <button
            onClick={() => setExpanded(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Collapse chat list"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="px-3 py-2 border-b">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
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
          <div className="p-4 text-center text-muted-foreground text-sm">
            No matches found
          </div>
        )}
      </div>
    </div>
  );
}