// src/components/chat/ChatContent.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Send, ImageIcon, Paperclip, MoreVertical } from "lucide-react";
import clsx from "clsx";

export default function ChatContent({ currentChat, messages, onSend, fullMode = true }) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={clsx("flex flex-col h-full", fullMode ? "" : "rounded-lg shadow-lg border border-gray-700")}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <div className="font-semibold text-lg">{currentChat?.otherUsername}</div>
          <div className="text-sm text-muted-foreground">Active 2 giờ trước</div>
        </div>
        <button className="text-muted-foreground">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg, i) => {
          const isSelf = msg.senderId === currentChat.selfId;
          return (
            <div key={i} className={clsx("flex", isSelf ? "justify-end" : "justify-start")}>
              {!isSelf && (
                <div className="w-8 h-8 rounded-full bg-gray-500 mr-2 flex-shrink-0" />
              )}
              <div
                className={clsx(
                  "px-4 py-2 rounded-2xl max-w-[70%]",
                  isSelf ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
                )}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-3 flex items-center gap-3">
        <button className="text-muted-foreground">
          <ImageIcon size={20} />
        </button>
        <button className="text-muted-foreground">
          <Paperclip size={20} />
        </button>
        <input
          className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-full outline-none"
          placeholder="Nhắn tin..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="text-blue-500">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
