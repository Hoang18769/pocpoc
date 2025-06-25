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
import useOnlineNotification from "@/hooks/useOnlineNotification"; // ✅ Import the hook

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
  
  // ✅ Get current user ID for online notifications
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // ✅ Initialize online notification hook
  const { 
    publishOnlineStatus, 
    getUserOnlineStatus, 
    getConnectionStatus 
  } = useOnlineNotification(currentUserId);
  
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const listRef = useRef(null);

  const isChatsPage = pathname === "/chats";

  // ✅ Get current user ID from localStorage
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) {
      setCurrentUserId(uid);
      console.log("👤 Current user ID set:", uid);
    }
  }, []);

  // ✅ Listen for online status changes
  useEffect(() => {
    const handleOnlineStatusChange = (event) => {
      const { userId, isOnline, lastOnline, timestamp, hasChatsWithUser } = event.detail;
      
      console.log("📱 Online status change event received in ChatList:", {
        userId,
        isOnline,
        lastOnline,
        timestamp,
        hasChatsWithUser,
        currentChatListLength: chatList.length
      });
      
      // Log detailed information about affected chats
      const affectedChats = chatList.filter(chat => {
        const hasInParticipants = chat.participants?.some(p => p.id === userId);
        const hasInTarget = chat.target?.id === userId;
        return hasInParticipants || hasInTarget;
      });
      
      console.log(`📊 Found ${affectedChats.length} chats affected by status change:`, 
        affectedChats.map(chat => ({
          chatId: chat.chatId || chat.id,
          targetName: chat.target?.fullName || chat.target?.username,
          participantCount: chat.participants?.length || 0
        }))
      );
    };

    window.addEventListener("onlineStatusChanged", handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener("onlineStatusChanged", handleOnlineStatusChange);
    };
  }, [chatList]);

  // ✅ Log connection status periodically
  useEffect(() => {
    if (!currentUserId) return;
    
    const logInterval = setInterval(() => {
      const status = getConnectionStatus();
      console.log("🔌 Online notification connection status:", status);
    }, 30000); // Log every 30 seconds
    
    return () => clearInterval(logInterval);
  }, [currentUserId, getConnectionStatus]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 ChatList Debug:", {
      chatListLength: chatList.length,
      isAuthenticated,
      authLoading,
      isLoadingChats,
      fetchAttempted,
      storeError,
      currentUserId,
      onlineConnectionStatus: currentUserId ? getConnectionStatus() : "No user ID"
    });
  }, [chatList.length, isAuthenticated, authLoading, isLoadingChats, fetchAttempted, storeError, currentUserId]);

  // ✅ MAIN FETCH LOGIC - Trigger when user becomes authenticated
  useEffect(() => {
    const shouldFetch = 
      isAuthenticated && 
      !authLoading && 
      !fetchAttempted &&
      typeof fetchChatList === 'function';

    if (shouldFetch) {
      console.log("🚀 Fetching chat list after authentication...");
      setFetchAttempted(true);
      
      fetchChatList()
        .then((data) => {
          console.log("✅ Chat list fetched successfully:", data?.length || 0, "chats");
          
          // ✅ Log online status for each chat after fetch
          if (data && data.length > 0) {
            console.log("📋 Online status summary after fetch:");
            data.forEach(chat => {
              const targetId = chat.target?.id;
              if (targetId) {
                const onlineStatus = getUserOnlineStatus(targetId);
                console.log(`  - ${chat.target?.fullName || chat.target?.username} (${targetId}): ${
                  onlineStatus?.isOnline ? '🟢 Online' : '🔴 Offline'
                } ${onlineStatus?.lastOnline ? `(Last: ${new Date(onlineStatus.lastOnline).toLocaleString()})` : ''}`);
              }
            });
          }
        })
        .catch((error) => {
          console.error("❌ Failed to fetch chat list:", error);
          setFetchAttempted(false);
        });
    }
  }, [isAuthenticated, authLoading, fetchAttempted, fetchChatList, getUserOnlineStatus]);

  // ✅ Reset fetch attempt when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setFetchAttempted(false);
    }
  }, [isAuthenticated]);

  // Auto-expand on chats page
  useEffect(() => {
    if (isChatsPage) setExpanded(true);
  }, [isChatsPage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current && chatList.length > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatList]);

  // ✅ Improved chat selection handler with online status logging
  const handleChatSelect = async (chat) => {
    if (!isAuthenticated || typeof markChatAsRead !== 'function') {
      return;
    }

    const chatId = chat.chatId || chat.id;
    const targetUserId = chat.target?.id;
    
    console.log("🎯 Selecting chat:", { 
      chatId, 
      targetUserId,
      currentNotReadCount: chat.notReadMessageCount,
      targetOnlineStatus: targetUserId ? getUserOnlineStatus(targetUserId) : null
    });
    
    try {
      await markChatAsRead(chatId);
      onSelectChat(chatId, chat.target);
    } catch (error) {
      console.error("❌ Error selecting chat:", error);
    }
  };

  // ✅ Manual refresh handler
  const handleRefresh = async () => {
    if (!isAuthenticated || typeof refreshChatList !== 'function') {
      return;
    }

    console.log("🔄 Manual refresh triggered");
    setFetchAttempted(false);
    
    try {
      await refreshChatList();
      console.log("✅ Manual refresh completed");
      console.log("🔌 Connection status after refresh:", getConnectionStatus());
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
    }
  };

  // Debounced search API call
  useEffect(() => {
    if (!searchTerm || !isAuthenticated) {
      setSearchResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        console.log("🔍 Searching chats with term:", searchTerm);
        const res = await api.get(`/v1/chat/search`, {
          params: { query: searchTerm },
        });
        const results = res.data.body || res.data || [];
        setSearchResults(results);
        console.log("🔍 Search results:", results.length, "chats found");
      } catch (err) {
        console.error("❌ Search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchTerm, isAuthenticated]);

  // ✅ Show loading while checking auth
  if (authLoading) {
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
    return null;
  }

  const filteredChats = searchResults ?? chatList;

  // ✅ Create unique chats for collapsed view with enhanced online status logging
  const uniqueChats = [
    ...new Map(
      chatList.map(chat => [
        chat.target?.userId || chat.target?.id || chat.target?.username, 
        chat
      ])
    ).values(),
  ];

  // ✅ Count online users with detailed logging
  const onlineUsers = uniqueChats.filter(chat => {
    const targetId = chat.target?.id;
    if (!targetId) return false;
    
    const onlineStatus = getUserOnlineStatus(targetId);
    const isOnline = chat.target?.onlineStatus?.isOnline || onlineStatus?.isOnline;
    
    if (isOnline) {
      console.log(`🟢 Online user found: ${chat.target?.fullName || chat.target?.username} (${targetId})`);
    }
    
    return isOnline;
  });
  
  const onlineCount = onlineUsers.length;
  
  console.log(`📊 Online users summary: ${onlineCount}/${uniqueChats.length} users online`);

  // ✅ Show loading state when fetching
  if (isLoadingChats) {
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
    return (
      <div
        role="button"
        onClick={() => setExpanded(true)}
        className="w-full md:w-[300px] max-w-md mx-auto flex items-center justify-between p-2 md:p-3 bg-background border rounded-full cursor-pointer hover:bg-accent transition-colors"
      >
        <div className="flex -space-x-2">
          {uniqueChats.slice(0, 3).map((chat, i) => {
            const targetId = chat.target?.id;
            const onlineStatus = targetId ? getUserOnlineStatus(targetId) : null;
            const isOnline = chat.target?.onlineStatus?.isOnline || onlineStatus?.isOnline;
            
            return (
              <div key={i} className="relative">
                <Avatar
                  src={chat.target?.profilePictureUrl}
                  alt={`${chat.target?.givenName} ${chat.target?.familyName}`}
                  size="sm"
                  className="border-2 border-background w-8 h-8 md:w-10 md:h-10"
                />
                {/* ✅ Enhanced online indicator */}
                {isOnline && (
                  <div className="absolute bottom-0 right-0">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border border-background">
                      <div className="absolute inset-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse opacity-75" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1 md:gap-2 ml-2">
          {/* ✅ Show online count */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {onlineCount > 0 && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="hidden sm:inline">{onlineCount} online</span>
                <span className="sm:hidden">{onlineCount}</span>
              </>
            )}
          </div>
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
  return (
    <div className="w-full md:max-w-md mx-auto bg-background flex flex-col border rounded-lg overflow-hidden h-full shadow-sm">
      {!isChatsPage && (
        <div className="flex items-center justify-between p-2 md:p-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-xs md:text-sm">Messages</h3>
            {/* ✅ Online count in header */}
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
        {filteredChats.length > 0 ? (
          [...filteredChats]
            .reverse()
            .map((chat) => {
              const targetId = chat.target?.id;
              const onlineStatus = targetId ? getUserOnlineStatus(targetId) : null;
              
              // ✅ Log chat render with online status
              console.log(`🎨 Rendering chat: ${chat.target?.fullName || 'Unknown'} - Online: ${
                chat.target?.onlineStatus?.isOnline || onlineStatus?.isOnline ? '🟢' : '🔴'
              }`);
              
              return (
                <div key={chat.chatId || chat.id}>
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