export default function ChatBox({ chatId, messages }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground text-sm mb-2">
        Đoạn chat ID: {chatId}
      </div>
      <div className="flex flex-col gap-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg ${
              msg.isOwn ? "bg-blue-500 self-end" : "bg-gray-700 self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
