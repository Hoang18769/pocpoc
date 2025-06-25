"use client";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, SearchIcon } from "lucide-react";
import ChatItem from "./ChatItem";
import Input from "../ui-components/Input";
import Avatar from "../ui-components/Avatar";
import { useEffect, useRef, useState } from "react";
import api from "@/utils/axios";
import useAppStore from "@/store/ZustandStore";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const pathname = usePathname();
  
  // Zustand store
  const { 
    chatList, 
    isLoadingChats, 
    fetchChatList,
    markChatAsRead,
    error: storeError 
  } = useAppStore();
  
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const listRef = useRef(null);

  const isChatsPage = pathname === "/chats";

  // Fetch data on mount if store is empty
  useEffect(() => {
    console.log(chatList)
    if (chatList.length === 0 && !isLoadingChats) {
      fetchChatList();
    }
  }, [chatList.length, isLoadingChats, fetchChatList]);

  // Auto-expand on chats page
  useEffect(() => {
    if (isChatsPage) setExpanded(true);
  }, [isChatsPage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatList]);

  const handleChatSelect = async (chat) => {
    // Use consistent field name - check store structure first
    const chatId = chat.chatId || chat.id;
    
    // Call store's markChatAsRead to update store state
    await markChatAsRead(chatId);
    
    // Notify parent component
    onSelectChat(chatId, chat.target);
  };
useEffect(() => {
  console.log("ChatList re-rendered, chatList:", chatList);
}, [chatList]);
  // Debounced search API call
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/v1/chat/search`, {
          params: { query: searchTerm },
        });
        setSearchResults(res.data.body);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const filteredChats = searchResults ?? chatList;

  // Fix unique chats logic - use consistent field
  const uniqueChats = [
    ...new Map(
      chatList.map(chat => [
        chat.target?.userId || chat.target?.id, 
        chat
      ])
    ).values(),
  ];

  // Loading state
  if (isLoadingChats && chatList.length === 0) {
    return (
      <div className="space-y-3 p-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (storeError) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        Failed to load chats. Please try again.
      </div>
    );
  }

  // Empty state
  if (!isLoadingChats && chatList.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  // Collapsed state - more compact on mobile
  if (!expanded && !isChatsPage) {
    return (
      <div
        role="button"
        onClick={() => setExpanded(true)}
        className="w-full md:w-[300px] max-w-md mx-auto flex items-center justify-between p-2 md:p-3 bg-background border rounded-full cursor-pointer hover:bg-accent transition-colors"
      >
        <div className="flex -space-x-2">
          {uniqueChats.slice(0, 3).map((chat, i) => (
            <div key={i} className="relative">
              <Avatar
                src={chat.target?.profilePictureUrl}
                alt={`${chat.target?.givenName} ${chat.target?.familyName}`}
                size="sm"
                className="border-2 border-background w-8 h-8 md:w-10 md:h-10"
              />
              {chat.target?.online && (
                <span className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border border-background" />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 md:gap-2 ml-2">
          <span className="text-xs md:text-sm text-muted-foreground hidden md:inline">
            {chatList.length > 3 ? `+${chatList.length - 3} more` : `${chatList.length} chats`}
          </span>
          <span className="text-xs text-muted-foreground md:hidden">
            {chatList.length}
          </span>
          <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Expanded state - more compact on mobile
  return (
    <div className="w-full md:max-w-md mx-auto bg-background flex flex-col border rounded-lg overflow-hidden h-full shadow-sm">
      {!isChatsPage && (
        <div className="flex items-center justify-between p-2 md:p-3 border-b">
          <h3 className="font-medium text-xs md:text-sm">Messages</h3>
          <button
            onClick={() => setExpanded(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Collapse chat list"
          >
            <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      )}

      {/* Search bar - hidden on mobile to save space */}
      <div className="px-2 md:px-3 py-1 md:py-2 border-b hidden md:block">
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
        style={{ maxHeight: isChatsPage ? "none" : window.innerWidth < 768 ? "250px" : "400px" }}
      >
        {filteredChats.length > 0 ? (
          [...filteredChats]
            .reverse()
            .map((chat) => (<>

              <ChatItem
                key={chat.chatId || chat.id}
                chat={chat}
                selected={selectedChatId === (chat.chatId || chat.id)}
                onClick={() => handleChatSelect(chat)}
              />
              <p></p>
            </>
            ))
        ) : (
          <div className="p-2 md:p-4 text-center text-muted-foreground text-xs md:text-sm">
            {isSearching ? "Searching..." : "No matches found"}
          </div>
        )}
      </div>
    </div>
  );
}