"use client";
import useChatList from "@/hooks/useChatList";
import { ChevronDown, ChevronUp, InboxIcon, SearchIcon } from "lucide-react";
import ChatItem from "./ChatItem";
import Input from "../ui-components/Input";
import Avatar from "../ui-components/Avatar";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const { chats, loading, error } = useChatList();
  const [expanded, setExpanded] = React.useState(false);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-destructive p-6 space-y-2">
        <InboxIcon className="w-10 h-10" />
        <p>Lỗi khi tải đoạn chat</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline mt-2"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <InboxIcon className="w-12 h-12 mb-3 opacity-70" />
        <h3 className="text-lg font-medium mb-1">Chưa có đoạn chat nào</h3>
        <p className="text-sm max-w-xs">
          Bắt đầu trò chuyện bằng cách tìm kiếm bạn bè hoặc tạo nhóm mới
        </p>
      </div>
    );
  }

  // Mini mode - chỉ hiển thị 3 user mới nhất
  if (!expanded) {
    return (
      <div className="flex items-center justify-between p-2 bg-background border rounded-lg cursor-pointer hover:bg-accent"
           onClick={() => setExpanded(true)}>
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
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {chats.length > 3 ? `+${chats.length - 3}` : ''}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Expanded mode - hiển thị đầy đủ danh sách
  return (
    <div className="flex flex-col border rounded-lg overflow-hidden">
      {/* Header với nút thu gọn */}
      <div className="flex items-center justify-between p-3 bg-background border-b">
        <h3 className="font-medium">Tin nhắn</h3>
        <button 
          onClick={() => setExpanded(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center bg-background px-3 py-2 border-b">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm đoạn chat..."
          className="w-full bg-transparent border-none focus-visible:ring-0 pl-2"
        />
      </div>

      {/* Danh sách chat */}
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {chats.map((chat) => (
          <ChatItem
            key={chat.chatId}
            chat={chat}
            selected={selectedChatId === chat.chatId}
            onClick={() => {
              onSelectChat(chat.chatId, chat.target);
              setExpanded(false); // Tự động thu gọn khi chọn chat
            }}
          />
        ))}
      </div>
    </div>
  );
}