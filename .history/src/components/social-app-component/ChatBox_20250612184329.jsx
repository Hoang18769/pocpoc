"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Paperclip, Send, Smile, Phone, Video, Info, ArrowLeft, X, Pencil,
} from "lucide-react";
import axios from "axios";

import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import Avatar from "../ui-components/Avatar";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  const [input, setInput] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const { messages, loading, refresh } = useChat(chatId); // refresh để reload sau PUT/DELETE
  const { sendMessage, isConnected } = useSendMessage({
    chatId,
    receiverUsername: targetUser?.username,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !isConnected) return;

    try {
      if (editingMsgId) {
        await axios.put(`/v1/chat/${editingMsgId}`, { content: trimmed });
        setEditingMsgId(null);
        refresh?.();
      } else {
        await sendMessage(trimmed);
      }
      setInput("");
    } catch (err) {
      console.error("❌ Lỗi gửi tin nhắn:", err);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    const formData = new FormData();
    formData.append("attachment", file);
    formData.append("username", targetUser.username);

    try {
      setUploading(true);
      await axios.post(`/v1/chat/send-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      refresh?.();
    } catch (err) {
      console.error("❌ Lỗi gửi file:", err);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/v1/chat/${id}`);
      refresh?.();
    } catch (err) {
      console.error("❌ Lỗi xóa tin nhắn:", err);
    }
  };

  const handleEdit = (msg) => {
    setEditingMsgId(msg.id);
    setInput(msg.content);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--card)] text-[var(--foreground)] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 py-1 border-b border-[var(--border)]">
        {onBack && showBackButton && (
          <button onClick={onBack} className="text-[var(--muted-foreground)] hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <Avatar src={targetUser?.profilePictureUrl} size="sm" />
        <div className="flex-1">
          <div className="font-semibold text-base">{targetUser?.givenName}</div>
          <div className="text-sm text-[var(--muted-foreground)]">
            {targetUser?.online ? "Online" : ""}
            <span className="ml-2">{isConnected ? "🟢" : "🔴"}</span>
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
        ) : messages.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center">Chưa có tin nhắn nào</p>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender?.id !== targetUser?.id;
            const isEditing = editingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={clsx("group flex items-end gap-2", {
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
                <div className="relative">
                  <div
                    className={clsx(
                      "rounded-xl px-3 py-2 max-w-[70%] text-sm break-words",
                      isSelf
                        ? "bg-blue-500 text-white"
                        : "bg-[var(--muted)] text-[var(--foreground)]"
                    )}
                  >
                    {msg.attachedFileUrl ? (
                      <a
                        href={msg.attachedFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {msg.attachedFileUrl.endsWith(".jpg") ||
                        msg.attachedFileUrl.endsWith(".png") ? (
                          <img
                            src={msg.attachedFileUrl}
                            alt="attachment"
                            className="max-w-xs rounded"
                          />
                        ) : (
                          "📎 Tệp đính kèm"
                        )}
                      </a>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {isSelf && !msg.attachedFileUrl && (
                    <div className="absolute right-full mr-1 bottom-0 hidden group-hover:flex gap-1">
                      <button
                        onClick={() => handleEdit(msg)}
                        className="text-xs text-yellow-500 hover:text-yellow-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
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

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[var(--muted-foreground)]"
          disabled={uploading}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        <input
          type="text"
          placeholder={editingMsgId ? "Chỉnh sửa tin nhắn..." : "Nhắn tin..."}
          className="flex-1 bg-transparent outline-none text-[var(--foreground)] px-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isConnected}
        />

        {editingMsgId && (
          <button
            onClick={() => {
              setEditingMsgId(null);
              setInput("");
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

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
