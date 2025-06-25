"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Paperclip, Send, Smile, Phone, Video, Info, ArrowLeft,
  MoreVertical, Edit, Trash2, Check, X, FileText, Image,
  Film, Music, Download, Eye
} from "lucide-react";
import axios from "axios";

import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import Avatar from "../ui-components/Avatar";
import api from "@/utils/axios";
import toast from "react-hot-toast";

export default function ChatBox({ chatId, targetUser, onBack }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const { messages, loading } = useChat(chatId);
  const { sendMessage, isConnected } = useSendMessage({
    chatId,
    receiverUsername: targetUser?.username,
  });

  // ... (giữ nguyên các useEffect khác)

  const handleSendFile = async () => {
    if (!selectedFile || !chatId || !targetUser?.username) {
      toast.error("Thiếu thông tin cần thiết để gửi file");
      return;
    }

    const formData = new FormData();
    formData.append("attachment", selectedFile);
    formData.append("username", targetUser.username);

    try {
      setUploading(true);
      const response = await api.post("/v1/chat/send-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.code === 200) {
        toast.success("Đã gửi file thành công!");
        handleCancelFile();
      } else {
        throw new Error(response.data.message || "Lỗi khi gửi file");
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi file:", error);
      toast.error(error.response?.data?.message || "Lỗi khi gửi file");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File không được vượt quá 10MB");
      e.target.value = "";
      return;
    }

    // Validate file type
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Loại file không được hỗ trợ");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    // Create preview for image files
    if (file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }

    e.target.value = ""; // Reset input để có thể chọn lại cùng file
  };

  const renderFileMessage = (msg) => {
    const file = msg.attachedFile;
    if (!file) return null;

    return (
      <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
        <div className="text-blue-500">
          {file.contentType.startsWith("image/") ? (
            <Image className="w-8 h-8" />
          ) : (
            <FileText className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{file.originalFilename}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {formatFileSize(file.size)}
          </div>
        </div>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
          title="Xem/Tải file"
        >
          <Eye className="w-5 h-5" />
        </a>
      </div>
    );
  };

  // ... (giữ nguyên các hàm helper khác như formatFileSize, getFileIcon)

  return (
    <div className="flex flex-col h-full w-full bg-[var(--card)] text-[var(--foreground)] rounded-2xl overflow-hidden shadow-sm">
      {/* Header (giữ nguyên) */}

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-2 bg-transparent">
        {loading ? (
          <p>Đang tải tin nhắn...</p>
        ) : messages.length === 0 ? (
          <p>Chưa có tin nhắn nào</p>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender?.id !== targetUser?.id;
            
            return (
              <div
                key={msg.id}
                className={clsx("flex items-start gap-2", {
                  "justify-end": isSelf,
                  "justify-start": !isSelf,
                })}
              >
                {/* Message bubble */}
                <div
                  className={clsx(
                    "rounded-xl px-3 py-2",
                    isSelf ? "bg-blue-500 text-white" : "bg-[var(--muted)]"
                  )}
                >
                  {msg.attachedFile ? (
                    renderFileMessage(msg)
                  ) : msg.deleted ? (
                    <span className="italic">Tin nhắn đã bị xóa</span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* File preview section */}
      {selectedFile && (
        <div className="border-t border-[var(--border)] p-3 bg-[var(--muted)]">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">File đã chọn:</span>
            <button
              onClick={handleCancelFile}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-[var(--background)] rounded-lg">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <FileText className="w-12 h-12 text-[var(--muted-foreground)]" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="truncate">{selectedFile.name}</div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSendFile}
              disabled={uploading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {uploading ? "Đang gửi..." : "Gửi file"}
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[var(--border)] p-3 bg-[var(--background)] flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-2"
          disabled={uploading}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*, application/pdf, .doc, .docx, .txt"
        />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedFile ? "Nhấn Enter để gửi file" : "Nhắn tin..."}
          className="flex-1 bg-transparent outline-none px-3 py-2 rounded-lg border border-[var(--border)]"
          disabled={uploading}
        />
        
        <button
          onClick={selectedFile ? handleSendFile : handleSend}
          disabled={uploading || (!selectedFile && !input.trim())}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}