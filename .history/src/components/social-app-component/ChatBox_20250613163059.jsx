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

  useEffect(() => {
    console.log(messages)
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

  // Cleanup file preview URL khi component unmount hoặc file thay đổi
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

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="w-8 h-8" />;
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (fileType.startsWith('video/')) return <Film className="w-8 h-8" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    // Giới hạn kích thước file (ví dụ: 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB");
      e.target.value = null;
      return;
    }

    setSelectedFile(file);

    // Tạo preview cho file
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
        // headers: { 
        //   "Content-Type": "multipart/form-data",
        // },
      });
      console.log(res)
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
    const isSelf = msg.sender?.id !== targetUser?.id;
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
      if(res.data.code === 200){
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
          {msg.deleted ? (
  "Tin nhắn đã bị thu hồi"
) : msg.attachedFile ? (
  <>
    {msg.attachedFile.contentType.startsWith('image/') && (
      <img
        src={msg.attachedFile.url}
        alt={msg.attachedFile.originalFilename}
        className="max-w-full rounded-md cursor-pointer"
        onClick={() => window.open(msg.attachedFile.url, '_blank')}
      />
    )}

    {msg.attachedFile.contentType.startsWith('video/') && (
      <video
        src={msg.attachedFile.url}
        controls
        className="max-w-full rounded-md"
      />
    )}

    {!msg.attachedFile.contentType.startsWith('image/') &&
      !msg.attachedFile.contentType.startsWith('video/') && (
        <div className="flex items-center gap-2 min-w-[200px]">
          {getFileIcon(msg.attachedFile.contentType)}
          <div className="flex-1">
            <div className="font-medium">
              {msg.attachedFile.originalFilename}
            </div>
            <div className="text-xs opacity-70">
              {formatFileSize(msg.attachedFile.size)}
            </div>
          </div>
          <a
            href={msg.attachedFile.url}
            download
            className="p-1 rounded hover:bg-black/10"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
    )}
  </>
) : (
  msg.content
)}

        )}
        <div ref={scrollRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--muted)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">File được chọn:</span>
            <button
              onClick={handleCancelFile}
              className="text-[var(--muted-foreground)] hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
            <div className="text-[var(--muted-foreground)]">
              {getFileIcon(selectedFile.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{selectedFile.name}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>

            {filePreview && (
              <div className="flex-shrink-0">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="w-12 h-12 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* <div className="flex gap-2">
            <button
              onClick={handleSendFile}
              disabled={uploading}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {uploading ? "Đang gửi..." : "Gửi file"}
            </button>
            <button
              onClick={handleCancelFile}
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] text-sm"
            >
              Hủy
            </button>
          </div> */}
        </div>
      )}

      {/* Input */}
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
          onChange={handleFileSelect}
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
          onKeyDown={handleKeyDown}
          disabled={!isConnected || selectedFile}
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
        ) : selectedFile ? (
          <>
            <button
              onClick={handleSendFile}
              disabled={uploading}
              className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
              title="Gửi file"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancelFile}
              className="text-red-500 hover:text-red-600"
              title="Hủy gửi file"
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