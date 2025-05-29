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
  const [isOpen, setIsOpen] = useState(true); // trạng thái mở/ẩn chatbox

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { type: "user", text: input.trim() }]);
    setInput("");
  };

  if (!isOpen) {
    // Biểu tượng khi chatbox bị thu gọn
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-md flex items-center justify-center hover:bg-blue-600 transition-colors"
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto shadow-lg rounded-2xl border flex flex-col bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-2 border-b">
        <Avatar src={avt} alt="User" size="xs" />
        <div className="font-medium">Name</div>
        <button
          className="ml-auto text-xl text-gray-500 hover:text-black transition"
          onClick={() => setIsOpen(false)}
          title="Minimize"
        >
          &minus;
        </button>
      </div>

      {/* Message Body */}
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

      {/* Input Toolbar */}
      <div className="p-1 border-t flex items-center gap-2">
        <Button className="w-4 h4" variant="ghost" size="icon">
          📎
        </Button>
        <Button className="w-4 h4" variant="ghost" size="icon">
          📷
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Aa"
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon">
          ➤
        </Button>
      </div>
    </div>
  );
}
