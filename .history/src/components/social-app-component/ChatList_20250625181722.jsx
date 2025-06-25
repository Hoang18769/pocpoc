"use client";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, SearchIcon, RefreshCw } from "lucide-react";
import ChatItem from "./ChatItem";
import Input from "../ui-components/Input";
import Avatar from "../ui-components/Avatar";
import { useEffect, useRef, useState } from "react";
import api from "@/utils/axios";
import useAppStore from "@/store/ZustandStore";
import { useAuth } from "@/hooks/useAuth";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Zustand store
  const { 
    chatList, 
    isLoadingChats, 
    fetchChatList,
    markChatAsRead,
    refreshChatList,
    error: storeError 
  } = useAppStore();
  
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const listRef = useRef(null);

  const isChatsPage = pathname === "/chats";

  // ✅ ENHANCED DEBUG LOGGING - Chat Store State
  useEffect(() => {
    console.group("🔍 ChatList Store Debug");
    console.log("📊 Store State:", {
      chatListLength: chatList?.length || 0,
      chatListType: typeof chatList,
      chatListIsArray: Array.isArray(chatList),
      isAuthenticated,
      authLoading,
      isLoadingChats,
      fetchAttempted,
      storeError,
      pathname
    });
    
    // ✅ Log first few chats for inspection
    if (Array.isArray(chatList) && chatList.length > 0) {
      console.log("💬 First 3 chats:", chatList.slice(0, 3).map(chat => ({
        id: chat.chatId || chat.id,
        target: chat.target ? {
          userId: chat.target.userId,
          name: `${chat.target.givenName || ''} ${chat.target.familyName || ''}`.trim(),
          username: chat.target.username,
          isOnline: chat.target.onlineStatus?.isOnline
        } : null,
        lastMessage: chat.lastMessage?.content?.substring(0, 50) + "...",
        unreadCount: chat.notReadMessageCount,
        timestamp: chat.lastMessage?.timestamp
      })));
    } else {
      console.log("📭 ChatList is empty or not an array:", chatList);
    }
    
    console.groupEnd();
  }, [chatList, isAuthenticated, authLoading, isLoadingChats, fetchAttempted, storeError, pathname]);

  // ✅ Log store method availability
  useEffect(() => {
    console.group("🛠️ Store Methods Debug");
    console.log("Available methods:", {
      fetchChatList: typeof fetchChatList,
      markChatAsRead: typeof markChatAsRead,
      refreshChatList: typeof refreshChatList,
      hasAllMethods: [fetchChatList, markChatAsRead, refreshChatList].every(fn => typeof fn === 'function')
    });
    console.groupEnd();
  }, [fetchChatList, markChatAsRead, refreshChatList]);

  // ✅ MAIN FETCH LOGIC with enhanced logging
  useEffect(() => {
    const shouldFetch = 
      isAuthenticated && 
      !authLoading && 
      !fetchAttempted &&
      typeof fetchChatList === 'function';

    console.group("🚀 Fetch Logic Check");
    console.log("Conditions:", {
      isAuthenticated,
      authLoading,
      fetchAttempted,
      fetchChatListAvailable: typeof fetchChatList === 'function',
      shouldFetch
    });

    if (shouldFetch) {
      console.log("✅ Starting chat list fetch...");
      setFetchAttempted(true);
      
      fetchChatList()
        .then((data) => {
          console.log("✅ Fetch SUCCESS:", {
            dataType: typeof data,
            dataLength: data?.length || 0,
            isArray: Array.isArray(data),
            sample: Array.isArray(data) ? data.slice(0, 2) : data
          });
        })
        .catch((error) => {
          console.error("❌ Fetch FAILED:", {
            error: error.message,
            stack: error.stack,
            response: error.response?.data
          });
          setFetchAttempted(false);
        });
    } else {
      console.log("⏸️ Fetch skipped - conditions not met");
    }
    console.groupEnd();
  }, [isAuthenticated, authLoading, fetchAttempted, fetchChatList]);

  // ✅ Reset fetch attempt when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("🔄 Auth lost - resetting fetch attempt");
      setFetchAttempted(false);
    }
  }, [isAuthenticated]);

  // Auto-expand on chats page
  useEffect(() => {
    if (isChatsPage) {
      console.log("📄 On chats page - auto expanding");
      setExpanded(true);
    }
  }, [isChatsPage]);

  // Scroll to bottom on new messages with logging
  useEffect(() => {
    if (listRef.current && chatList.length > 0) {
      console.log("📜 Scrolling to bottom - new chats:", chatList.length);
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatList]);

  // ✅ Enhanced chat selection handler with logging
  const handleChatSelect = async (chat) => {
    console.group("🎯 Chat Selection");
    console.log("Selected chat:", {
      chatId: chat.chatId || chat.id,
      target: chat.target?.givenName + " " + chat.target?.familyName,
      unreadCount: chat.notReadMessageCount,
      isAuthenticated,
      markChatAsReadAvailable: typeof markChatAsRead === 'function'
    });

    if (!isAuthenticated || typeof markChatAsRead !== 'function') {
      console.log("❌ Cannot select chat - not authenticated or missing method");
      console.groupEnd();
      return;
    }

    const chatId = chat.chatId || chat.id;
    
    try {
      console.log("📝 Marking chat as read...");
      await markChatAsRead(chatId);
      console.log("✅ Chat marked as read, calling onSelectChat");
      onSelectChat(chatId, chat.target);
    } catch (error) {
      console.error("❌ Error selecting chat:", {
        error: error.message,
        chatId,
        stack: error.stack
      });
    }
    console.groupEnd();
  };

  // ✅ Manual refresh handler with logging
  const handleRefresh = async () => {
    console.group("🔄 Manual Refresh");
    console.log("Refresh conditions:", {
      isAuthenticated,
      refreshChatListAvailable: typeof refreshChatList === 'function'
    });

    if (!isAuthenticated || typeof refreshChatList !== 'function') {
      console.log("❌ Cannot refresh - conditions not met");
      console.groupEnd();
      return;
    }

    console.log("🔄 Starting manual refresh...");
    setFetchAttempted(false);
    
    try {
      const result = await refreshChatList();
      console.log("✅ Manual refresh completed:", result);
    } catch (error) {
      console.error("❌ Manual refresh failed:", {
        error: error.message,
        stack: error.stack
      });
    }
    console.groupEnd();
  };

  // Debounced search API call with logging
  useEffect(() => {
    if (!searchTerm || !isAuthenticated) {
      if (searchResults !== null) {
        console.log("🔍 Clearing search results");
        setSearchResults(null);
      }
      return;
    }

    const timeout = setTimeout(async () => {
      console.group("🔍 Search API Call");
      console.log("Search term:", searchTerm);
      
      try {
        setIsSearching(true);
        const res = await api.get(`/v1/chat/search`, {
          params: { query: searchTerm },
        });
        
        console.log("✅ Search results:", {
          dataType: typeof res.data,
          bodyLength: res.data.body?.length || 0,
          dataLength: res.data?.length || 0
        });
        
        setSearchResults(res.data.body || res.data || []);
      } catch (err) {
        console.error("❌ Search failed:", {
          error: err.message,
          response: err.response?.data
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
      console.groupEnd();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchTerm, isAuthenticated]);

  // ✅ Show loading while checking auth
  if (authLoading) {
    console.log("⏳ Showing auth loading state");
    return (
      <div className="space-y-3 p-4 animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-1/2" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  // ✅ Don't render if not authenticated
  if (!isAuthenticated) {
    console.log("🚫 Not authenticated - not rendering ChatList");
    return null;
  }

  const filteredChats = searchResults ?? chatList;
  console.log("📊 Filtered chats:", {
    usingSearchResults: searchResults !== null,
    filteredLength: filteredChats?.length || 0,
    originalLength: chatList?.length || 0
  });

  // ✅ Create unique chats for collapsed view with online status
  const uniqueChats = [
    ...new Map(
      (Array.isArray(chatList) ? chatList : []).map(chat => [
        chat.target?.userId || chat.target?.id || chat.target?.username, 
        chat
      ])
    ).values(),
  ];

  console.log("👥 Unique chats:", {
    uniqueCount: uniqueChats.length,
    originalCount: chatList?.length || 0
  });

  // ✅ Count online users
  const onlineCount = uniqueChats.filter(chat => 
    chat.target?.onlineStatus?.isOnline
  ).length;

  console.log("🟢 Online users:", onlineCount);

  // ✅ Show loading state when fetching
  if (isLoadingChats) {
    console.log("⏳ Showing loading state");
    return (
      <div className="space-y-3 p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-6 w-6 bg-muted rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  // ✅ Enhanced error state with retry
  if (storeError) {
    console.log("❌ Showing error state:", storeError);
    return (
      <div className="p-4 text-center text-sm">
        <div className="text-destructive mb-2">
          Failed to load chats
        </div>
        <div className="text-muted-foreground text-xs mb-3">
          {storeError}
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isLoadingChats}
          className="flex items-center gap-2 mx-auto px-3 py-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingChats ? 'animate-spin' : ''}`} />
          {isLoadingChats ? 'Retrying...' : 'Try again'}
        </button>
      </div>
    );
  }

  // ✅ Enhanced empty state
  if (!isLoadingChats && chatList.length === 0 && fetchAttempted) {
    console.log("📭 Showing empty state");
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="mb-2">No conversations yet</div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 mx-auto px-3 py-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    );
  }

  // ✅ Enhanced collapsed state with online status
  if (!expanded && !isChatsPage) {
    console.log("📦 Showing collapsed state");
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
              {chat.target?.onlineStatus?.isOnline && (
                <div className="absolute bottom-0 right-0">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border border-background">
                    <div className="absolute inset-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse opacity-75" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 md:gap-2 ml-2">
          {onlineCount > 0 && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="hidden sm:inline">{onlineCount} online</span>
              <span className="sm:hidden">{onlineCount}</span>
            </>
          )}
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

  // Expanded state
  console.log("📋 Rendering expanded chat list with", filteredChats?.length || 0, "chats");
  
  return (
    <div className="w-full md:max-w-md mx-auto bg-background flex flex-col border rounded-lg overflow-hidden h-full shadow-sm">
      {!isChatsPage && (
        <div className="flex items-center justify-between p-2 md:p-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-xs md:text-sm">Messages</h3>
            {onlineCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>{onlineCount} online</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoadingChats}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              aria-label="Refresh chats"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingChats ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collapse chat list"
            >
              <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
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
        {Array.isArray(filteredChats) && filteredChats.length > 0 ? (
          [...filteredChats]
            .reverse()
            .map((chat, index) => {
              console.log(`🔄 Rendering chat ${index}:`, {
                chatId: chat.chatId || chat.id,
                target: chat.target?.givenName + " " + chat.target?.familyName,
                hasTarget: !!chat.target
              });
              
              return (
                <div key={chat.chatId || chat.id || index}>
                  <ChatItem
                    chat={chat}
                    selected={selectedChatId === (chat.chatId || chat.id)}
                    onClick={() => handleChatSelect(chat)}
                  />
                </div>
              );
            })
        ) : (
          <div className="p-2 md:p-4 text-center text-muted-foreground text-xs md:text-sm">
            {isSearching ? "Searching..." : searchTerm ? "No matches found" : "No chats available"}
          </div>
        )}
      </div>
    </div>
  );
}