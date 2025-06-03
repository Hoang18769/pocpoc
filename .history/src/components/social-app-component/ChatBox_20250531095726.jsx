"use client";

import { useState } from "react";
import Card from "../ui-components/Card";
import Input from "../ui-components/Input";
import Button from "../ui-components/Button";
import Avatar from "@/components/ui-components/Avatar";
import avt from "@/assests/photo/AfroAvatar.png";

export default function Chatbox() {
  const [messages, setMessages] = useState([
    {
      type: "system",
      text: "Welcome to Name. Thanks for getting in touch with us on Messenger. Can we assist with lorem ipsum?",
    },
    { type: "user", text: "Question A goes here" },
    { type: "user", text: "Question B goes here" },
    { type: "user", text: "Question C goes here" },
    { type: "bot", text: "Answer C goes here" },
  ]);

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // bắt đầu thu gọn

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { type: "user", text: input.trim() }]);
    setInput("");
  };

  // Nếu đóng -> hiển thị nút kiểu Messenger
 
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 bg-[var(--card)] text-[var(--foreground)] p-4 rounded-full shadow-lg dark:hover:bg-zinc-400 transition-colors"
      >
        <svg viewBox="0 0 36 36" width="20" height="20" fill="currentColor">
          <path d="M18 0C8.058 0 0 7.28 0 16.25c0 4.84 2.36 9.17 6.22 12.14v6.81l6.12-3.36c1.7.47 3.5.73 5.66.73 9.942 0 18-7.28 18-16.25S27.942 0 18 0zm2.3 21.56l-3.94-4.25-7.42 4.25 8.02-8.65 3.89 4.18 7.54-4.18-8.09 8.65z" />
        </svg>
        <span className="font-medium">Tin nhắn</span>
        <div className="flex -space-x-2">
          <Avatar size="xs" src="/users/u1.jpg" alt="u1" />
          <Avatar size="xs" src="/users/u2.jpg" alt="u2" />
          <Avatar size="xs" src="/users/u3.jpg" alt="u3" />
        </div>
      </button>
    );
  }

  // Giao diện chatbox
  return (
    <div className="w-full max-w-md mx-auto shadow-lg rounded-2xl border flex flex-col bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-2 border-b">
        <Avatar src={avt} alt="User" size="xs" />
        <div className="font-medium">Name</div>
        <button
          className="ml-auto text-xl text-gray-500 hover:text-black transition"
          onClick={() => setIsOpen(false)}
          title="Thu nhỏ"
        >
          &minus;
        </button>
      </div>

      {/* Nội dung tin nhắn */}
      <div className="flex-1 min-h-[250px] overflow-y-auto p-4 space-y-3 bg-[var(--background)] text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xs px-4 py-2 rounded-xl ${
              msg.type === "user"
                ? "bg-white self-end border ml-auto"
                : msg.type === "bot"
                ? "bg-white border flex items-start gap-2"
                : "text-center text-gray-500 text-xs mx-auto"
            }`}
          >
            {msg.type === "bot" ? (
              <>
                <Avatar src={avt} size="xs" />
                <div>{msg.text}</div>
              </>
            ) : (
              msg.text
            )}
          </div>
        ))}
      </div>

      {/* Nhập tin nhắn */}
      <div className="p-1 border-t flex items-center gap-2">
        <Button className="w-4 h4" variant="ghost" size="icon">📎</Button>
        <Button className="w-4 h4" variant="ghost" size="icon">📷</Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Aa"
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon">➤</Button>
      </div>
    </div>
  );
}
