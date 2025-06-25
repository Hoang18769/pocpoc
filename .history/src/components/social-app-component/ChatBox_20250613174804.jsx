"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import api from "@/utils/axios";

// Import các components đã tách
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
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { messages, loading } = useChat(chatId);
  const { sendMessage, isConnected } = useSendMessage({
    chatId,
    receiverUsername: targetUser?.username,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Keep scroll position when new messages arrive
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // ... (keep all other existing functions and effects the same)

  return (
    <div className="flex flex-col h-full w-full bg-[var(--card)] text-[var(--foreground)] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <ChatHeader 
        targetUser={targetUser}
        isConnected={isConnected}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      {/* Messages container with reverse flex */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 px-4 overflow-y-auto flex flex-col-reverse"
      >
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-[var(--muted-foreground)] py-3">
              Đang tải tin nhắn...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-3">
              Chưa có tin nhắn nào
            </p>
          ) : (
            [...messages].reverse().map((msg) => (
              <MessageItem
                key={msg.id}
                msg={msg}
                targetUser={targetUser}
                selectedMessage={selectedMessage}
                onMessageClick={handleMessageClick}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
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