// components/chat/MessagesList.jsx
"use client";

import { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";

export default function MessagesList({ 
  messages, 
  targetUser, 
  currentUserId,
  selectedMessage,
  onMessageClick,
  onEditMessage,
  onDeleteMessage
}) {
  const scrollRef = useRef(null);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [messages]);

  return (
    <div className="flex-1 px-4 py-3 overflow-y-auto space-y-2 bg-transparent flex flex-col">
      {messages.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center">
          Chưa có tin nhắn nào
        </p>
      ) : (
        <div className="flex-1 flex flex-col justify-end">
          <div className="space-y-2">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                msg={msg}
                targetUser={targetUser}
                isOwnMessage={msg.sender?.id === currentUserId}
                isSelected={selectedMessage === msg.id}
                onMessageClick={onMessageClick}
                onEditMessage={onEditMessage}
                onDeleteMessage={onDeleteMessage}
              />
            ))}
          </div>
          <div ref={scrollRef} />
        </div>
      )}
    </div>
  );
}