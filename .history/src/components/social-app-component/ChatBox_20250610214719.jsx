"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, Smile, Phone, Video, Info } from "lucide-react";
import useChatMessage from "@/hooks/useChatMessage";
import Avatar from "../ui-components/Avatar";
import clsx from "clsx";

export default function ChatBox({ chatId, targetUser }) {
  const { messages, loading } = useChatMessage(chatId);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      console.log("Sending:", input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--card)] text-[var(--foreground)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
        <Avatar src={targetUser.profilePictureUrl} size="md" />
        <div className="flex-1">
          <div className="font-semibold text-base">{targetUser.givenName}</div>
          <div className="text-sm text-[var(--muted-foreground)]">
            {targetUser.online ? "Online" : "Đang hoạt động trước đó"}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
          <Phone className="w-5 h-5 cursor-pointer" />
          <Video className="w-5 h-5 cursor-pointer" />
          <Info className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto flex flex-col gap-2 bg-transparent">
        {loading ? (
          <p className="text-sm text-[var(--muted-foreground)]">Đang tải tin nhắn...</p>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender.id !== targetUser.id;
            return (
              <div
                key={msg.id}
                className={clsx("flex items-end gap-2", {
                  "justify-end": isSelf,
                  "justify-start": !isSelf,
                })}
              >
                {!isSelf && (
                  <Avatar
                    src={targetUser.profilePictureUrl}
                    size="xs"
                    className="flex-shrink-0"
                  />
                )}
                <div
                  className={clsx(
                    "rounded-xl px-3 py-2 max-w-[70%] text-sm",
                    isSelf
                      ? "bg-blue-500 text-white"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] px-4 py-3 flex items-center gap-3 bg-[var(--background)]">
        <button className="text-[var(--muted-foreground)]">
          <Smile className="w-5 h-5" />
        </button>
        <button className="text-[var(--muted-foreground)]">
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder="Nhắn tin..."
          className="flex-1 bg-transparent outline-none text-[var(--foreground)] px-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="text-blue-500 hover:text-blue-600"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
