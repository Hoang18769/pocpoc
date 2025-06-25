import { useRef } from "react";
import clsx from "clsx";
import {
  Paperclip, Send, Smile, Check, X
} from "lucide-react";

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

  return (
    <div className="border-t border-[var(--border)] px-4 py-3 flex items-center gap-3 bg-[var(--background)]">
      <button className="text-[var(--muted-foreground)]">
        <Smile className="w-5 h-5" />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        disabled={uploading || selectedFile}
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

      <input
        type="text"
        placeholder={
          selectedFile
            ? "Nhấn Enter để gửi file hoặc Esc để hủy"
            : editingMessage 
            ? "Chỉnh sửa tin nhắn..." 
            : isConnected 
            ? "Nhắn tin..." 
            : "Đang kết nối..."
        }
        className="flex-1 bg-transparent outline-none text-[var(--foreground)] px-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={!isConnected || selectedFile}
      />

      {editingMessage ? (
        <>
          <button
            onClick={onSaveEdit}
            className="text-green-500 hover:text-green-600"
            title="Lưu chỉnh sửa"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={onCancelEdit}
            className="text-red-500 hover:text-red-600"
            title="Hủy chỉnh sửa"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      ) : selectedFile ? (
        <>
          <button
            onClick={onSendFile}
            disabled={uploading}
            className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
            title="Gửi file"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={onCancelFile}
            className="text-red-500 hover:text-red-600"
            title="Hủy gửi file"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      ) : (
        <button
          onClick={onSend}
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
  );
}