import useChatList from "@/hooks/useChatList";
import { InboxIcon } from "lucide-react";
import ChatItem from "./ChatItem";

export default function ChatList() {
  const { chats, loading, error } = useChatList();

  if (loading) return <p className="text-muted-foreground">Đang tải...</p>;
  if (error) return <p className="text-destructive">Đã xảy ra lỗi khi tải đoạn chat.</p>;

  if (chats.length === 0) {
  return (
    <div className=" flex flex-col items-center justify-center text-muted-foreground py-6">
      <InboxIcon className="w-10 h-10 mb-2" />
      <p>Chưa có đoạn chat nào</p>
    </div>
  );
}


  return (
    <div className="h-full border flex flex-col gap-2">
      {chats.map(chat => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}
