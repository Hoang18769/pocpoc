"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import api from "@/utils/axios";

import ChatHeader from "./ChatHeader";
import MessageItem from "./MessageItem";
import FilePreviewInChat from "../ui-components/FilePreviewInChat";
import ChatInput from "./ChatInput";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const scrollRef = useRef(null);
  const prevMessageId = useRef(null);

  const { messages, loading, currentUserId } = useChat(chatId);
  const { sendMessage, isConnected } = useSendMessage({
    chatId,
    receiverUsername: targetUser?.username,
  });

  // Auto scroll khi có tin nhắn mới
useEffect(() => {
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.isOwnMessage || lastMessage.id !== prevMessageId.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }, 100);
    }
    prevMessageId.current = lastMessage.id;
  }
}, [messages]);

  // Click outside để bỏ chọn tin nhắn
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.message-container')) {
        setSelectedMessage(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cleanup file preview
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !isConnected) return;

    try {
      await sendMessage(trimmed);
      setInput("");
    } catch (err) {
      console.error("❌ Lỗi gửi tin nhắn:", err);
      toast.error("Lỗi khi gửi tin nhắn");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedFile) {
        handleSendFile();
      } else if (editingMessage) {
        handleSaveEdit();
      } else {
        handleSend();
      }
    }
    
    if (e.key === "Escape") {
      if (selectedFile) {
        handleCancelFile();
      } else if (editingMessage) {
        handleCancelEdit();
      }
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB");
      e.target.value = null;
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }

    e.target.value = null;
  };

  const handleSendFile = async () => {
    if (!selectedFile || !chatId || !targetUser?.username) return;

    const formData = new FormData();
    formData.append("attachment", selectedFile);
    formData.append("username", targetUser.username);

    try {
      setUploading(true);
      const res = await api.post(`/v1/chat/send-file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (res.data) {
        toast.success("File đã được gửi thành công!");
        handleCancelFile();
      }
    } catch (err) {
      console.error("❌ Lỗi gửi file:", err);
      toast.error("Lỗi khi gửi file");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelFile = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleMessageClick = (msg) => {
    const isSelf = msg.sender?.id === currentUserId;
    if (isSelf && !msg.deleted) {
      setSelectedMessage(selectedMessage === msg.id ? null : msg.id);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/v1/chat/${messageId}`);
      setSelectedMessage(null);
      toast.success("Đã xóa tin nhắn");
    } catch (err) {
      console.error("❌ Lỗi xóa tin nhắn:", err);
      toast.error("Lỗi khi xóa tin nhắn");
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
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
      const res = await api.put("/v1/chat/edit", {
        messagesId: editingMessage.id,
        text: trimmed,
      });
      
      if (res.data.code === 200) {
        setEditingMessage(null);
        setInput("");
        toast.success("Sửa tin nhắn thành công!");
      }
    } catch (err) {
      console.error("❌ Lỗi sửa tin nhắn:", err);
      toast.error("Có lỗi khi sửa tin nhắn");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--card)] text-[var(--foreground)] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <ChatHeader 
        targetUser={targetUser}
        isConnected={isConnected}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      {/* Messages */}
<div className="flex-1 px-4 py-3 overflow-y-auto bg-transparent flex flex-col">
  {loading ? (
    <p className="text-sm text-[var(--muted-foreground)]">
      Đang tải tin nhắn...
    </p>
  ) : messages.length === 0 ? (
    <p className="text-sm text-[var(--muted-foreground)] text-center">
      Chưa có tin nhắn nào
    </p>
  ) : (
    <div className="flex-1 flex flex-col justify-end">
      <div className="space-y-2">
        {messages.slice().reverse().map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            targetUser={targetUser}
            isOwnMessage={msg.sender?.id === currentUserId}
            selectedMessage={selectedMessage}
            onMessageClick={handleMessageClick}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        ))}
      </div>
      <div ref={scrollRef} />
    </div>
  )}
</div>

      {/* File Preview */}
      <FilePreviewInChat 
        selectedFile={selectedFile}
        filePreview={filePreview}
        onCancel={handleCancelFile}
      />

      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        isConnected={isConnected}
        selectedFile={selectedFile}
        editingMessage={editingMessage}
        uploading={uploading}
        onSend={handleSend}
        onSendFile={handleSendFile}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onCancelFile={handleCancelFile}
        onFileSelect={handleFileSelect}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}