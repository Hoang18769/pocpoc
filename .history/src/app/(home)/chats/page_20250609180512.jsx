"use client";

import { useState } from "react";
import ChatBox from "@/components/social-app-component/ChatBox";
import CH
export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-full">
      <div className="w-full md:w-1/3 border-r h-full overflow-y-auto">
        <ChatList onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>
      <div className="flex-1 h-full overflow-hidden">
        {selectedChat ? (
          <ChatBox chat={selectedChat} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Chọn một đoạn chat để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
}
