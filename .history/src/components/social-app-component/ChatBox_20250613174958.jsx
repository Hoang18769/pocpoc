"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import api from "@/utils/axios";

// Components
import ChatHeader from "./ChatHeader";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import FilePreviewInChat from "../ui-components/FilePreviewInChat";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  // State
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hooks
  const { messages, loading } = useChat(chatId);
  const { sendMessage, isConnected } = useSendMessage({
    chatId,
    receiverUsername: targetUser?.username,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  // Send file to server
  const handleSendFile = async () => {
    if (!selectedFile || !chatId) return;

    const formData = new FormData();
    formData.append("attachment", selectedFile);
    formData.append("username", targetUser.username);

    try {
      setUploading(true);
      const res = await api.post(`/v1/chat/send-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (res.data) {
        toast.success("File sent successfully");
        handleCancelFile();
      }
    } catch (err) {
      toast.error("Failed to send file");
      console.error("File send error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Cleanup file preview
  const handleCancelFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Message actions
  const handleMessageClick = (msg) => {
    const isOwnMessage = msg.sender?.id !== targetUser?.id;
    if (isOwnMessage && !msg.deleted) {
      setSelectedMessage(selectedMessage === msg.id ? null : msg.id);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/v1/chat/${messageId}`);
      setSelectedMessage(null);
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
      console.error("Delete error:", err);
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setInput(msg.content);
    setSelectedMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!input.trim() || !editingMessage) return;

    try {
      await api.put("/v1/chat/edit", {
        messagesId: editingMessage.id,
        text: input.trim(),
      });
      setEditingMessage(null);
      setInput("");
      toast.success("Message updated");
    } catch (err) {
      toast.error("Failed to edit message");
      console.error("Edit error:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInput("");
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedFile) handleSendFile();
      else if (editingMessage) handleSaveEdit();
      else handleSend();
    }
    
    if (e.key === "Escape") {
      if (selectedFile) handleCancelFile();
      else if (editingMessage) handleCancelEdit();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--card)] rounded-2xl overflow-hidden shadow-sm">
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
        <div className="space-y-2 pt-2">
          {loading ? (
            <div className="flex justify-center py-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Loading messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center py-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                No messages yet
              </p>
            </div>
          ) : (
            [...messages].reverse().map((msg) => (
              <MessageItem
                key={msg.id}
                msg={msg}
                targetUser={targetUser}
                selected={selectedMessage === msg.id}
                onClick={handleMessageClick}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File preview section */}
      {selectedFile && (
        <FilePreviewInChat
          file={selectedFile}
          preview={filePreview}
          onCancel={handleCancelFile}
          onSend={handleSendFile}
          uploading={uploading}
        />
      )}

      {/* Chat input */}
      <ChatInput
        input={input}
        setInput={setInput}
        isConnected={isConnected}
        selectedFile={selectedFile}
        editingMessage={editingMessage}
        onSend={handleSend}
        onSendFile={handleSendFile}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onCancelFile={handleCancelFile}
        onFileSelect={handleFileSelect}
        onKeyDown={handleKeyDown}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}