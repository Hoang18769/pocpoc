"use client";

import ChatList from "@/components/social-app-component/ChatList";

export default function ChatLayout({ children }) {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-black text-white divide-x divide-gray-800">
      {/* Sidebar - Chat list */}
      <aside className="w-[30%] p-4 overflow-y-auto">
        <div className="text-xl font-semibold mb-4 px-2">Tin nhắn</div>
        <ChatList />
      </aside>

      {/* Main content - Chat box or placeholder */}
      <main className="w-[70%] p-4 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
