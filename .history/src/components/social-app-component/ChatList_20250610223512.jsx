import useChatList from "@/hooks/useChatList";
import { InboxIcon, SearchIcon } from "lucide-react";
import ChatItem from "./ChatItem";
import Input from "../ui-components/Input";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const { chats, loading, error } = useChatList();

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

  return (
    <div className="flex flex-col h-full">
      {/* Thanh tìm kiếm sử dụng flex */}
      <div className="border flex items-center justify-center bg-background">
          <SearchIcon className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Tìm kiếm đoạn chat..."
            className="w-full bg-transparent border-none focus-visible:ring-0"
          />
      </div>

      {/* Danh sách chat */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <ChatItem
            key={chat.chatId}
            chat={chat}
            selected={selectedChatId === chat.chatId}
            onClick={() => onSelectChat(chat.chatId, chat.target)}
          />
        ))}
      </div>
    </div>
  );
}