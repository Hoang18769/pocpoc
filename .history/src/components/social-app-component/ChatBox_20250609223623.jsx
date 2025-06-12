import use

export default function ChatBox({ chatId }) {
  const { messages, loading } = useChatMessages(chatId);

  if (loading) return <p className="text-muted-foreground">Đang tải tin nhắn...</p>;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-2 rounded-lg max-w-[70%] ${
            msg.isOwn ? "bg-blue-500 self-end text-white" : "bg-gray-700 self-start"
          }`}
        >
          <span className="text-sm">{msg.content}</span>
        </div>
      ))}
    </div>
  );
}
