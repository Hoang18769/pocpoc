"use client";

export default function ChatLayout({ children }) {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-black text-white">
      {/* Sidebar - Chat list */}
      <aside className="w-[40%] border-r border-gray-800 p-4 overflow-y-auto">
        <div className="text-xl font-semibold mb-4 px-2">Tin nhắn</div>
        <ChatL
      </aside>

      {/* Main content - Chat box or placeholder */}
      <main className="w-[60%] p-4 flex flex-col">
        {children}
      </main>
    </div>
  );
}
