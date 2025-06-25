"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

import useChat from "@/hooks/useChat";
import useSendMessage from "@/hooks/useSendMessageSocket";
import useAppStore from "@/store/ZustandStore";
import api from "@/utils/axios";

// Import các components đã tách
import ChatHeader from "./ChatHeader";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import FilePreviewInChat from "../ui-components/FilePreviewInChat";

export default function ChatBox({ chatId, targetUser, onBack, onChatCreated }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/chats";

  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const [isNewChat, setIsNewChat] = useState(!chatId);
  const scrollRef = useRef(null);

  // Store actions
  const fetchChatList = useAppStore((state) => state.fetchChatList);
  const selectChat = useAppStore((state) => state.selectChat);
  const clearChatSelection = useAppStore((state) => state.clearChatSelection);
  const updateChatListAfterMessage = useAppStore((state) => state.updateChatListAfterMessage);
  const currentUser = useAppStore((state) => state.currentUser); // Cần để lấy thông tin user hiện tại

  // Chỉ gọi useChat khi có chatId
  const { messages, loading } = useChat(currentChatId);
  const { sendMessage, isConnected } = useSendMessage({
    chatId: currentChatId,
    receiverUsername: targetUser?.username,
  });

  // Cập nhật currentChatId khi chatId prop thay đổi
  useEffect(() => {
    if (chatId !== currentChatId) {
      setCurrentChatId(chatId);
      setIsNewChat(!chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (messages?.length > 0) {
      const timeout = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return () => clearTimeout(timeout);
    }
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

  // ✅ Helper function để cập nhật chat list
  const updateChatListOrder = (chatId, messageContent, messageType = 'text') => {
    if (!updateChatListAfterMessage) {
      console.warn("updateChatListAfterMessage function not found in store");
      return;
    }

    const lastMessage = {
      content: messageContent,
      type: messageType,
      sender: currentUser,
      createdAt: new Date().toISOString(),
    };

    updateChatListAfterMessage(chatId, lastMessage);
  };

  // ✅ Tạo chat mới với luồng hoàn chỉnh
  const createNewChat = async (message) => {
    try {
      console.log("🚀 Creating new chat with:", { 
        receiverUsername: targetUser?.username, 
        message 
      });

      const response = await api.post('/v1/chat/send', {
        username: targetUser?.username,
        text: message
      });
      
      if (response.data?.body.chatId) {
        const newChatId = response.data.body.chatId;
        console.log("✅ New chat created with ID:", newChatId);
        
        // Cập nhật state local
        setCurrentChatId(newChatId);
        setIsNewChat(false);
        
        // ✅ Fetch lại chatlist để cập nhật store
        await fetchChatList();
        
        // ✅ Update store selection
        selectChat(newChatId);
        
        // ✅ Cập nhật thứ tự chat list
        updateChatListOrder(newChatId, message, 'text');
        
        // ✅ Callback để parent component cập nhật
        if (onChatCreated) {
          onChatCreated(newChatId, targetUser);
        }
        
        toast.success("Đã tạo cuộc trò chuyện mới!");
        return newChatId;
      }
      throw new Error('Không thể tạo chat mới');
    } catch (error) {
      console.error('❌ Lỗi tạo chat:', error);
      toast.error('Không thể tạo cuộc trò chuyện mới');
      throw error;
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      if (isNewChat) {
        // Tạo chat mới với tin nhắn đầu tiên
        await createNewChat(trimmed);
      } else {
        // Gửi tin nhắn bình thường
        if (!isConnected) {
          toast.error('Chưa kết nối đến server');
          return;
        }
        
        // Gửi tin nhắn
        await sendMessage(trimmed);
        
        // ✅ Cập nhật chat list order sau khi gửi thành công
        updateChatListOrder(currentChatId, trimmed, 'text');
      }
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
    if (!file) return;

    // Nếu là chat mới, không cho phép gửi file trước khi có chat
    if (isNewChat) {
      toast.error("Vui lòng gửi tin nhắn đầu tiên trước khi gửi file");
      e.target.value = null;
      return;
    }

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
    if (!selectedFile || !currentChatId || !targetUser?.username) return;

    const formData = new FormData();
    formData.append("attachment", selectedFile);
    formData.append("username", targetUser.username);

    try {
      setUploading(true);
      const res = await api.post(`/v1/chat/send-file`, formData);
      console.log(res);
      if (res.data) {
        toast.success("File đã được gửi thành công!");
        
        // ✅ Cập nhật chat list với file message
        const fileMessage = selectedFile.type.startsWith('image/') 
          ? '📷 Hình ảnh' 
          : selectedFile.type.startsWith('video/')
          ? '🎥 Video'
          : selectedFile.type.startsWith('audio/')
          ? '🎵 Audio'
          : `📎 ${selectedFile.name}`;
          
        updateChatListOrder(currentChatId, fileMessage, 'file');
        
        handleCancelFile();
      }
    } catch (err) {
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
      console.log(msg.id);
      setSelectedMessage(selectedMessage === msg.id ? null : msg.id);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/v1/chat/${messageId}`);
      setSelectedMessage(null);
      toast.success("Đã xóa tin nhắn");
      
      // ✅ Có thể cần cập nhật lại chat list nếu tin nhắn bị xóa là tin nhắn cuối
      // Tùy thuộc vào logic backend có trả về tin nhắn mới nhất không
    } catch (err) {
      console.error("❌ Lỗi xóa tin nhắn:", err);
      toast.error("Lỗi khi xóa tin nhắn");
    }
  };

  const handleEditMessage = (msg) => {
    console.log("📝 Sửa tin nhắn:", msg);
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
        
        // ✅ Nếu tin nhắn được sửa là tin nhắn cuối cùng, cập nhật chat list
        if (messages && messages[messages.length - 1]?.id === editingMessage.id) {
          updateChatListOrder(currentChatId, trimmed, 'text');
        }
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
        isConnected={isNewChat ? true : isConnected} // Hiển thị connected cho chat mới
        onBack={onBack}
        showBackButton={showBackButton}
      />

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-2 bg-transparent">
        {loading && currentChatId ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Đang tải tin nhắn...
          </p>
        ) : isNewChat ? (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--muted-foreground)]">
              Bắt đầu cuộc trò chuyện với {targetUser?.displayName || targetUser?.username}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Nhập tin nhắn để tạo cuộc trò chuyện mới
            </p>
          </div>
        ) : messages?.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center">
            Chưa có tin nhắn nào
          </p>
        ) : (
          messages?.slice().reverse().map((msg) => (
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
        <div ref={scrollRef} />
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
        isConnected={isNewChat ? true : isConnected}
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
        placeholder={isNewChat ? `Nhắn tin cho ${targetUser?.displayName || targetUser?.username}...` : "Nhập tin nhắn..."}
      />
    </div>
  );
}