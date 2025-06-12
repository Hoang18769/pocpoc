"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, Smile, Phone, Video, Info } from "lucide-react";
import useChatMessage from "@/hooks/useChatMessages";
import Avatar from "../ui-components/Avatar";
import clsx from "clsx";

// Giả sử target user info sẽ được truyền từ cha hoặc tạm hardcode
const mockTargetUser = {
  givenName: "Chocobibo",
  profilePictureUrl: "https://i.pravatar.cc/150?img=5",
  online: false,
};

export default function ChatBox({ chatId }) {
  const { messages, loading } = useChatMessages(chatId);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      // TODO: Gửi qua WebSocket hoặc gọi API
      console.log("Sending:", input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <Avatar src={mockTargetUser.profilePictureUrl} size="md" />
        <div className="flex-1">
          <div className="font-medium text-lg">{mockTargetUser.givenName}</div>
          <div className="text-sm text-muted-foreground">
            {mockTargetUser.online ? "Online" : "Active 2 giờ trước"}
          </div>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Phone className="w-5 h-5 cursor-pointer" />
          <Video className="w-5 h-5 cursor-pointer" />
          <Info className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-2 overflow-y-auto flex flex-col gap-2">
        {loading ? (
          <p>Đang tải tin nhắn...</p>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender.id !== mockTargetUser.id;
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
                    src={mockTargetUser.profilePictureUrl}
                    size="xs"
                    className="flex-shrink-0"
                  />
                )}
                <div
                  className={clsx(
                    "rounded-xl px-3 py-2 max-w-[70%] text-sm",
                    isSelf
                      ? "bg-blue-500 text-white"
                      : "bg-muted text-white"
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
      <div className="border-t border-gray-800 p-3 flex items-center gap-2">
        <button className="text-muted-foreground">
          <Smile className="w-5 h-5" />
        </button>
        <button className="text-muted-foreground">
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder="Nhắn tin..."
          className="flex-1 bg-transparent outline-none text-white px-2"
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
