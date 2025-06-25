"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Paperclip, Send, Smile, Phone, Video, Info, ArrowLeft,
  MoreVertical, Edit, Trash2, Check, X
} from "lucide-react";
import axios from "axios";

import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import Avatar from "../ui-components/Avatar";
import api from "@/utils/axios";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const { messages, loading } = useChat(chatId);
  const { sendMessage, isConnected } = useSendMessage({
    chatId,
    receiverUsername: targetUser?.username,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.message-container')) {
        setSelectedMessage(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !isConnected) return;

    try {
      await sendMessage(trimmed);
      setInput("");
    } catch (err) {
      console.error("❌ Lỗi gửi tin nhắn:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      editingMessage ? handleSaveEdit() : handleSend();
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
    } catch (err) {
      console.error("❌ Lỗi gửi file:", err);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleMessageClick = (msg) => {
    const isSelf = msg.sender?.id !== targetUser?.id;
    if (isSelf && !msg.deleted) {
      setSelectedMessage(selectedMessage === msg.id ? null : msg.id);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/v1/chat/${messageId}`);
      setSelectedMessage(null);
    } catch (err) {
      console.error("❌ Lỗi xóa tin nhắn:", err);
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    console.log(msg)
    setInput(msg.content);
    setSelectedMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInput("");
  };

  const handleSaveEdit = async () => {
    const trimmed = input.trim();
    if (!trimmed || !editingMessage) return;

    try {
      const res=await api.put("/v1/chat/edit", {
        messagesId: editingMessage.id,
        text: trimmed,
      });
      console.log(editingMessage)
      setEditingMessage(null);
      setInput("");
    } catch (err) {
      console.error("❌ Lỗi sửa tin nhắn:", err);
    }
  };

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
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-2 bg-transparent">
        {loading ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Đang tải tin nhắn...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center">
            Chưa có tin nhắn nào
          </p>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender?.id !== targetUser?.id;
            const isSelected = selectedMessage === msg.id;

            return (
              <div
                key={msg.id}
                className={clsx("flex items-start gap-2 group message-container", {
                  "justify-end": isSelf,
                  "justify-start": !isSelf,
                })}
              >
                {!isSelf && (
                  <Avatar
                    src={targetUser?.profilePictureUrl}
                    size="xs"
                    className="flex-shrink-0 mt-1"
                  />
                )}

                <div className={clsx("flex items-start gap-2 max-w-[60%]", {
                  "flex-row-reverse": isSelf,
                  "flex-row": !isSelf,
                })}>
                  {isSelf && !msg.deleted && (
                    <div className="flex items-center group-hover:opacity-100 transition-opacity duration-200 mt-1 flex-shrink-0">
                      <button
                        onClick={() => handleMessageClick(msg)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <div
                      className={clsx(
                        "rounded-xl px-3 py-2 text-sm inline-block",
                        msg.deleted
                          ? "bg-gray-200 text-gray-500 italic dark:bg-gray-700 dark:text-gray-400"
                          : isSelf
                          ? "bg-blue-500 text-white"
                          : "bg-[var(--muted)] text-[var(--foreground)]"
                      )}
                      style={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '100%'
                      }}
                    >
                      {msg.deleted ? "Tin nhắn đã bị thu hồi" : msg.content}
                    </div>

                    {isSelected && isSelf && !msg.deleted && (
                      <div className="absolute top-0 left-0 transform -translate-x-full -translate-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10 min-w-[100px]">
                        <button
                          onClick={() => handleEditMessage(msg)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
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
          placeholder={isConnected ? "Nhắn tin..." : "Đang kết nối..."}
          className="flex-1 bg-transparent outline-none text-[var(--foreground)] px-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isConnected}
        />

        {editingMessage ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="text-green-500 hover:text-green-600"
              title="Lưu chỉnh sửa"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-red-500 hover:text-red-600"
              title="Hủy chỉnh sửa"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
}
