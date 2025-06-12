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
import useSendMessage from "@/hooks/useSendMessageSocket";

import Avatar from "../ui-components/Avatar";
import clsx from "clsx";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const { messages, loading } = useChatMessage(chatId);
  const [input, setInput] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const scrollRef = useRef(null);
  const pathname = usePathname();

  // Destructure để lấy cả sendMessage và isConnected
  const { sendMessage, isConnected } = useSendMessage({
    chatId,
    receiverUsername: targetUser?.username,
  });

  const showBackButton = pathname !== "/chats";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, realtimeMessages]);

  useChatSocket(chatId, (newMessage) => {
    setRealtimeMessages((prev) => [...prev, newMessage]);
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Kiểm tra kết nối trước khi gửi
    if (!isConnected) {
      console.warn("⚠️ Socket chưa kết nối, không thể gửi tin nhắn");
      return;
    }

    const messageText = input.trim();
    console.log("🧪 Đang gửi tin nhắn:", messageText);
    
    try {
      // Gửi tin nhắn qua socket
      await sendMessage(messageText);
      
      // Xóa input sau khi gửi thành công
      setInput("");
      
      console.log("✅ Tin nhắn đã gửi thành công");
    } catch (error) {
      console.error("❌ Lỗi gửi tin nhắn:", error);
      // Có thể hiển thị thông báo lỗi cho user ở đây
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Ngăn xuống dòng
      handleSend();
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
        <Avatar src={targetUser?.profilePictureUrl} size="sm" />
        <div className="flex-1">
          <div className="font-semibold text-base">{targetUser?.givenName}</div>
          <div className="text-sm text-[var(--muted-foreground)]">
            {targetUser?.online ? "Online" : ""}
            {/* Hiển thị trạng thái socket */}
            <span className="ml-2">
              {isConnected ? "🟢" : "🔴"}
            </span>
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
        ) : allMessages.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center">
            Chưa có tin nhắn nào
          </p>
        ) : (
          allMessages.map((msg, index) => {
            const isSelf = msg.sender?.id !== targetUser?.id;
            return (
              <div
                key={msg.id || msg.createdAt || `msg-${index}`}
                className={clsx("flex items-end gap-2", {
                  "justify-end": isSelf,
                  "justify-start": !isSelf,
                })}
              >
                {!isSelf && (
                  <Avatar
                    src={targetUser?.profilePictureUrl}
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
          placeholder={isConnected ? "Nhắn tin..." : "Đang kết nối..."}
          className="flex-1 bg-transparent outline-none text-[var(--foreground)] px-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
          className={clsx(
            "transition-colors",
            isConnected && input.trim()
              ? "text-blue-500 hover:text-blue-600"
              : "text-gray-400 cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}