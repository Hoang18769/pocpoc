// src/components/chat/ChatLayout.jsx
export default function ChatLayout({ chatList, chatContent }) {
  return (
    <div className="flex h-screen text-white bg-black">
      {/* Left: Chat list (40%) */}
      <aside className="w-[40%] border-r border-gray-800 p-4 overflow-y-auto">
        <div className="text-xl font-semibold mb-4 px-2">Tin nhắn</div>
        <div className="flex flex-col gap-2">{chatList}</div>
      </aside>

      {/* Right: Chat content (60%) */}
      <main className="w-[60%] p-4 flex flex-col">
        {chatContent}
      </main>
    </div>
  );
}
