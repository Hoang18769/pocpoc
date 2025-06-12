import useChatList from "@/hooks/useChatList";
import { InboxIcon, SearchIcon } from "lucide-react";
import ChatItem from "./ChatItem";
import Input from "../ui-components/Input";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const { chats, loading, error } = useChatList();

  // ... (giữ nguyên các phần loading, error, empty state)

  return (
    <div className="flex flex-col h-full">
      {/* Thanh tìm kiếm - icon sát input */}
      <div className="flex items-center bg-background px-3 py-2 border-b">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm đoạn chat..."
          className="w-full bg-transparent border-none focus-visible:ring-0 pl-2"
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