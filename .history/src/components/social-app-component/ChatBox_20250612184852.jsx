"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Paperclip, Send, Smile, Phone, Video, Info, ArrowLeft,
} from "lucide-react";
import axios from "axios";

import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import Avatar from "../ui-components/Avatar";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
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
      handleSend();
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
      e.target.value = null; // reset input
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
      <div className="flex-1 px-4 py-3 overflow-y-auto flex flex-col gap-2 bg-transparent">
        {loading ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Đang tải tin nhắn...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center">
            Chưa có tin nhắn nào
          </p>
        ) : (
          messages.map((msg, index) => {
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

export default function ChatBox({ chatId, targetUser, onBack }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editInput, setEditInput] = useState("");
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

  // Close message actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.message-actions')) {
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
      handleSend();
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
      e.target.value = null; // reset input
    }
  };

  const handleMessageClick = (msg) => {
    const isSelf = msg.sender?.id !== targetUser?.id;
    if (isSelf) {
      setSelectedMessage(selectedMessage === msg.id ? null : msg.id);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/v1/chat/${messageId}`);
      setSelectedMessage(null);
      // Optionally trigger a refresh of messages or remove from local state
    } catch (err) {
      console.error("❌ Lỗi xóa tin nhắn:", err);
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg.id);
    setEditInput(msg.content);
    setSelectedMessage(null);
  };

  const handleSaveEdit = async (messageId) => {
    const trimmed = editInput.trim();
    if (!trimmed) return;

    try {
      await axios.put(`/v1/chat/${messageId}`, {
        content: trimmed
      });
      setEditingMessage(null);
      setEditInput("");
      // Optionally trigger a refresh of messages or update local state
    } catch (err) {
      console.error("❌ Lỗi sửa tin nhắn:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditInput("");
  };

  const handleEditKeyDown = (e, messageId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(messageId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
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
      <div className="flex-1 px-4 py-3 overflow-y-auto flex flex-col gap-2 bg-transparent">
        {loading ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Đang tải tin nhắn...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center">
            Chưa có tin nhắn nào
          </p>
        ) : (
          messages.map((msg, index) => {
            const isSelf = msg.sender?.id !== targetUser?.id;
            const isEditing = editingMessage === msg.id;
            const isSelected = selectedMessage === msg.id;
            
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
                <div className="relative message-actions">
                  <div
                    className={clsx(
                      "rounded-xl px-3 py-2 max-w-[70%] text-sm cursor-pointer transition-all",
                      isSelf
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-[var(--muted)] text-[var(--foreground)]",
                      isSelected && isSelf && "ring-2 ring-blue-300"
                    )}
                    onClick={() => handleMessageClick(msg)}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, msg.id)}
                          className="bg-transparent border-none outline-none text-white placeholder-blue-200 flex-1"
                          placeholder="Nhập tin nhắn..."
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="text-green-300 hover:text-green-100"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-300 hover:text-red-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  
                  {/* Message Actions Menu */}
                  {isSelected && isSelf && !isEditing && (
                    <div className="absolute top-0 right-0 transform translate-x-full -translate-y-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10">
                      <button
                        onClick={() => handleEditMessage(msg)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
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