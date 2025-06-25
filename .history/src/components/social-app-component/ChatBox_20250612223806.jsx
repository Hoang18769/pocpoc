"use client";

import { useChat } from "@/hooks/useChat";
import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ChatBox({ chatId, receiverUsername }) {
  const {
    messages,
    message,
    setMessage,
    sendMessage,
    handleEditMessage,
    handleDeleteMessage,
  } = useChat(chatId, receiverUsername);

  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage();
  };

  const handleEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditingContent(msg.content);
    setSelectedMessageId(null);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim()) return;
    handleEditMessage(editingMessageId, editingContent);
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleMessageClick = (msg) => {
    setSelectedMessageId((prev) => (prev === msg.id ? null : msg.id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.map((msg) => {
          const isSelf = msg.isSelf;
          const isSelected = selectedMessageId === msg.id;
          const isEditing = editingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`group relative flex ${
                isSelf ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-sm md:max-w-md break-words rounded-xl px-4 py-2 text-sm ${
                  isSelf
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-1">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Hủy
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Lưu
                      </Button>
                    </div>
                  </div>
                ) : (
                  msg.content
                )}
              </div>

              {/* Nút MoreVertical luôn hiện cho mọi tin nhắn */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 flex-shrink-0">
                <button
                  onClick={() => handleMessageClick(msg)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Menu khi nhấn MoreVertical */}
              {isSelected && !isEditing && (
                <div
                  className={`absolute top-full mt-1 z-10 bg-white border rounded shadow-md text-sm w-28 ${
                    isSelf ? "right-6" : "left-6"
                  }`}
                >
                  <button
                    onClick={() => handleEdit(msg)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex items-center gap-2"
      >
        <Input
          placeholder="Nhắn tin..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit">Gửi</Button>
      </form>
    </div>
  );
}
