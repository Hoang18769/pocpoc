import useChatMessages from "@/hooks/useChatMessage";

export default function ChatBox({ chatId }) {
  const { messages, loading } = useChatMessages(chatId);

  if (loading) return <p>Đang tải tin nhắn...</p>;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className="text-sm">
          <strong>{msg.sender.givenName}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}
