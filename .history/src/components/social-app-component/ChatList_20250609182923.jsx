import useChatList from "@/hooks/useChatList";

export default function ChatList() {
  const { chats, loading, error } = useChatList();

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi khi tải danh sách chat</p>;

  return (
    <div className="flex flex-col gap-2">
      {chats.map(chat => (
        <div key={chat.chatId} className="p-2 border rounded">
          <p className="font-medium">{chat.otherUser.name}</p>
          <p className="text-sm text-muted-foreground">
            {chat.latestMessage?.content || "Không có tin nhắn"}
          </p>
        </div>
      ))}
    </div>
  );
}
