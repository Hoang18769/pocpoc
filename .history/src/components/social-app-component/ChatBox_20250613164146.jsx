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

  // Hàm kiểm tra loại file dựa trên đuôi file
  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.toLowerCase().split('.').pop();
  };

  const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const ext = getFileExtension(filename);
    return imageExtensions.includes(ext);
  };

  const isVideoFile = (filename) => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'];
    const ext = getFileExtension(filename);
    return videoExtensions.includes(ext);
  };

  // Hàm render nội dung file attachment
  const renderAttachment = (attachment, isSelf) => {
    if (!attachment) return null;

    const filename = attachment.originalFilename || attachment.filename || '';
    const isImage = isImageFile(filename);
    const isVideo = isVideoFile(filename);

    if (isImage) {
      // Hiển thị ảnh
      return (
        <div className="max-w-xs">
          <img
            src={attachment.url}
            alt={filename || 'Image'}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
            style={{ maxHeight: '300px' }}
          />
          {filename && (
            <div className={clsx(
              "text-xs mt-1 opacity-70",
              isSelf ? "text-blue-100" : "text-[var(--muted-foreground)]"
            )}>
              {filename}
            </div>
          )}
        </div>
      );
    } else if (isVideo) {
      // Hiển thị video
      return (
        <div className="max-w-xs">
          <video
            src={attachment.url}
            controls
            className="rounded-lg max-w-full h-auto"
            style={{ maxHeight: '300px' }}
          >
            Your browser does not support the video tag.
          </video>
          {filename && (
            <div className={clsx(
              "text-xs mt-1 opacity-70",
              isSelf ? "text-blue-100" : "text-[var(--muted-foreground)]"
            )}>
              {filename}
            </div>
          )}
        </div>
      );
    } else {
      // Hiển thị file khác (tên file + nút download)
      return (
        <div className="flex items-center gap-2 min-w-[200px] max-w-xs">
          <div className={clsx(
            "flex-shrink-0",
            isSelf ? "text-blue-100" : "text-[var(--muted-foreground)]"
          )}>
            {getFileIcon(attachment.contentType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className={clsx(
              "font-medium text-sm truncate",
              isSelf ? "text-white" : "text-[var(--foreground)]"
            )}>
              {filename || 'Unknown file'}
            </div>
            <div className={clsx(
              "text-xs opacity-70",
              isSelf ? "text-blue-100" : "text-[var(--muted-foreground)]"
            )}>
              {formatFileSize(attachment.size)}
            </div>
          </div>
          <a
            href={attachment.url}
            download={filename}
            className={clsx(
              "p-1 rounded hover:bg-black/10 flex-shrink-0",
              isSelf ? "text-blue-100 hover:bg-white/10" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            )}
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      );
    }
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

                <div className={clsx("flex items-start gap-2 max-w-[70%]", {
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
                          : "bg-[var(--muted)] text-[var(--foreground)]",
                        // Thêm padding khác nhau cho attachment
                        msg.attachment && !msg.deleted ? "p-2" : "px-3 py-2"
                      )}
                      style={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '100%'
                      }}
                    >
                      {msg.deleted ? (
                        "Tin nhắn đã bị thu hồi"
                      ) : msg.attachment ? (
                        // Hiển thị attachment (không có text kèm theo)
                        renderAttachment(msg.attachment, isSelf)
                      ) : msg.attachedFile ? (
                        // Compatibility với attachedFile cũ
                        <div className="flex items-center gap-2 min-w-[200px]">
                          {getFileIcon(msg.attachedFile.contentType)}
                          <div className="flex-1">
                            <div className="font-medium">{msg.attachedFile.originalFilename}</div>
                            <div className="text-xs opacity-70">
                              {formatFileSize(msg.attachedFile.size)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {isImageFile(msg.attachedFile.originalFilename) && (
                              <button
                                className="p-1 rounded hover:bg-black/10"
                                onClick={() => window.open(msg.attachedFile.url, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <a
                              href={msg.attachedFile.url}
                              download
                              className="p-1 rounded hover:bg-black/10"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        // Hiển thị text content
                        msg.content
                      )}
                            
                      {msg.edited && !msg.deleted && (
                        <div className={clsx(
                          "text-xs mt-1 opacity-70",
                          isSelf ? "text-blue-100" : "text-[var(--muted-foreground)]"
                        )}>
                          <Edit className="w-3 h-3 inline mr-1" />
                          <span>đã chỉnh sửa</span>
                        </div>
                      )}
                    </div>

                    {isSelected && isSelf && !msg.deleted && (
                      <div className="absolute top-0 left-0 transform -translate-x-full -translate-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10 min-w-[100px]">
                        {!msg.attachment && !msg.attachedFile && (
                          <button
                            onClick={() => handleEditMessage(msg)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Sửa</span>
                          </button>
                        )}
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