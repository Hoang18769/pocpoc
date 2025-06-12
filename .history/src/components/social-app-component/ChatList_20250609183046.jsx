import useChatList from "@/hooks/useChatList";

export default function ChatList() {
  const { chats, loading, error } = useChatList();

  if (loading) return <p className="text-muted-foreground">Đang tải...</p>;
  if (error) return <p className="text-destructive">Đã xảy ra lỗi khi tải đoạn chat.</p>;

  if (chats.length === 0) {
    return <p className="text-muted-foreground">Chưa có đoạn chat nào.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {chats.map(chat => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}
