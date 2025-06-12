export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [targetUser, setTargetUser] = useState(null);

  const handleSelectChat = (chatId, user) => {
    setSelectedChatId(chatId);
    setTargetUser(user);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black text-white divide-x divide-gray-800">
      <aside className="w-[30%] p-4 overflow-y-auto">
        <div className="text-xl font-semibold mb-4 px-2">Tin nhắn</div>
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </aside>

      <main className="w-[70%] p-4 flex flex-col overflow-y-auto">
        {selectedChatId ? (
          <ChatBox chatId={selectedChatId} targetUser={targetUser} />
        ) : (
          <div className="text-muted-foreground text-center mt-10">
            Chọn một đoạn chat để bắt đầu trò chuyện
          </div>
        )}
      </main>
    </div>
  );
}
