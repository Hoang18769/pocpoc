"use client";

import { useRef } from "react";
import clsx from "clsx";
import { Paperclip, Send, Smile, Check, X } from "lucide-react";

export default function ChatInput({
  input,
  setInput,
  isConnected,
  selectedFile,
  editingMessage,
  uploading,
  onSend,
  onSendFile,
  onSaveEdit,
  onCancelEdit,
  onCancelFile,
  onFileSelect,
  onKeyDown
}) {
  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t border-[var(--border)] px-4 py-3 flex items-center gap-3 bg-[var(--background)]">
      {/* Emoji button (placeholder) */}
      <button type="button" className="text-[var(--muted-foreground)]">
        <Smile className="w-5 h-5" />
      </button>

      {/* File attachment */}
      <button
        type="button"
        onClick={handleFileButtonClick}
        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        disabled={uploading || selectedFile}
        aria-label="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />

      {/* Message input */}
      <input
        type="text"
        placeholder={getPlaceholderText(selectedFile, editingMessage, isConnected)}
        className="flex-1 bg-transparent outline-none text-[var(--foreground)] px-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={!isConnected || selectedFile}
      />

      {/* Action buttons */}
      {renderActionButtons({
        editingMessage,
        selectedFile,
        uploading,
        isConnected,
        input,
        onSend,
        onSendFile,
        onSaveEdit,
        onCancelEdit,
        onCancelFile
      })}
    </div>
  );
}

// Helper function to determine placeholder text
function getPlaceholderText(selectedFile, editingMessage, isConnected) {
  if (selectedFile) return "Nhấn Enter để gửi file hoặc Esc để hủy";
  if (editingMessage) return "Chỉnh sửa tin nhắn...";
  return isConnected ? "Nhắn tin..." : "Đang kết nối...";
}

// Helper function to render appropriate action buttons
function renderActionButtons({
  editingMessage,
  selectedFile,
  uploading,
  isConnected,
  input,
  onSend,
  onSendFile,
  onSaveEdit,
  onCancelEdit,
  onCancelFile
}) {
  if (editingMessage) {
    return (
      <>
        <ActionButton 
          icon={<Check />} 
          onClick={onSaveEdit} 
          color="green" 
          title="Lưu chỉnh sửa" 
        />
        <ActionButton 
          icon={<X />} 
          onClick={onCancelEdit} 
          color="red" 
          title="Hủy chỉnh sửa" 
        />
      </>
    );
  }

  if (selectedFile) {
    return (
      <>
        <ActionButton 
          icon={<Send />} 
          onClick={onSendFile} 
          color="blue" 
          title="Gửi file" 
          disabled={uploading}
        />
        <ActionButton 
          icon={<X />} 
          onClick={onCancelFile} 
          color="red" 
          title="Hủy gửi file" 
        />
      </>
    );
  }

  return (
    <ActionButton 
      icon={<Send />} 
      onClick={onSend} 
      color="blue" 
      disabled={!isConnected || !input.trim()} 
    />
  );
}

// Reusable button component
function ActionButton({ icon, onClick, color, title, disabled = false }) {
  const colorClasses = {
    blue: "text-blue-500 hover:text-blue-600",
    green: "text-green-500 hover:text-green-600",
    red: "text-red-500 hover:text-red-600",
    gray: "text-gray-400 cursor-not-allowed"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "transition-colors",
        disabled ? colorClasses.gray : colorClasses[color]
      )}
      disabled={disabled}
      title={title}
    >
      {icon}
    </button>
  );
}