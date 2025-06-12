"use client";
import { usePathname } from "next/navigation";
import useChatList from "@/hooks/useChatList";
import { ChevronDown, ChevronUp, InboxIcon, SearchIcon } from "lucide-react";
import ChatItem from "./ChatItem";
import Input from "../ui-components/Input";
import Avatar from "../ui-components/Avatar";
import { useEffect, useRef, useState } from "react";
import MotionContainer from "../ui-components/MotionContainer";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const pathname = usePathname();
  const { chats, loading, error } = useChatList();
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef(null);

  // Luôn mở expanded mode khi ở route /chats
  useEffect(() => {
    if (pathname === "/chats") {
      setExpanded(true);
    }
  }, [pathname]);

  // Tự động scroll xuống dưới khi mở expanded
  useEffect(() => {
    if (expanded && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [expanded, chats]);

  if (loading) {
    return <div className="space-y-3 p-4">...</div>;
  }

  if (error) {
    return <div className="...">...</div>;
  }

  if (chats.length === 0) {
    return <div className="...">...</div>;
  }

  // Chặn mini mode khi ở route /chats
  const isChatsPage = pathname === "/chats";
  if (!expanded && !isChatsPage) {
    return (
      <MotionContainer modeKey="mini" effect="scaleY" duration={0.3}>
        <div 
          className="w-full max-w-md mx-auto flex items-center justify-between p-3 bg-background border rounded-lg cursor-pointer hover:bg-accent"
          onClick={() => setExpanded(true)}
        >
          <div className="flex -space-x-2">
            {chats.slice(0, 3).map((chat, index) => (
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
              {chats.length > 3 ? `+${chats.length - 3} tin nhắn` : `${chats.length} tin nhắn`}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </MotionContainer>
    );
  }

  return (
    <MotionContainer modeKey="expanded" effect="scaleY" duration={0.3}>
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
          />
        </div>

        {/* Danh sách chat */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ maxHeight: isChatsPage ? 'none' : '400px' }}
        >
          <div>
            {[...chats].reverse().map((chat) => (
              <ChatItem
                key={chat.chatId}
                chat={chat}
                selected={selectedChatId === chat.chatId}
                onClick={() => {
                  onSelectChat(chat.chatId, chat.target);
                  if (!isChatsPage) setExpanded(false);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </MotionContainer>
  );
}