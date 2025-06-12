"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Paperclip,
  Send,
  Smile,
  Phone,
  Video,
  Info,
  ArrowLeft,
} from "lucide-react";
import useChatMessage from "@/hooks/useChatMessage";
import useChatSocket from "@/hooks/useChatSocket";
import useSendChatMessage from "@/hooks/useSendChatMessage";

import Avatar from "../ui-components/Avatar";
import clsx from "clsx";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const { messages, loading } = useChatMessage(chatId);
  const [input, setInput] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const scrollRef = useRef(null);
  const pathname = usePathname();

  const showBackButton = pathname !== "/chats";

  // Tự động scroll khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, realtimeMessages]);

  // Nhận tin nhắn realtime từ WebSocket
  useChatSocket(chatId, (newMessage) => {
    setRealtimeMessages((prev) => [...prev, newMessage]);
  });

  // Gửi tin nhắn (WebSocket hoặc API tùy vào triển khai sau)
  const handleSend = () => {
    if (input.trim()) {
      const newMsg = {
        chatId,
        content: input,
      };

      // Gửi tin nhắn đến server (bạn cần chỉnh `/app/chat.send`)
      const client = window.__stompClient;
      if (client?.connected) {
        client.publish({
          destination: "/app/chat.send", // cần backend hỗ trợ endpoint này
          body: JSON.stringify(newMsg),
        });
      } else {
        console.warn("WebSocket not connected. Cannot send message.");
      }

      setInput("");
    }
  };

  const allMessages = [...messages, ...realtimeMessages];

  return (
    <div className="flex flex-col h-full w-full bg-[var(--card)] text-[var(--foreground)] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 py-1 border-b border-[var(--border)]">
        {onBack && showBackButton && (
          <button
            onClick={onBack}
            className="text-[var(--muted-foreground)] hover:text-foreground"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
        )}
        <Avatar src={targetUser.profilePictureUrl} size="sm" />
        <div className="flex-1">
          <div className="font-semibold text-base">{targetUser.givenName}</div>
          <div className="text-sm text-[var(--muted-foreground)]">
            {targetUser.online ? "Online" : ""}
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
          <p className="text-sm text-[var(--muted-foreground)]">
            Đang tải tin nhắn...
          </p>
        ) : (
          allMessages.map((msg) => {
            const isSelf = msg.sender?.id !== targetUser.id;
            return (
              <div
                key={msg.id || msg.createdAt || Math.random()}
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
