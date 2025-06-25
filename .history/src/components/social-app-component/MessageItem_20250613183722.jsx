// components/chat/MessageItem.jsx
"use client";

import clsx from "clsx";
import { Edit, Trash2, Download, Eye } from "lucide-react";
import Avatar from "../ui-components/Avatar";

export default function MessageItem({
  msg,
  targetUser,
  isOwnMessage,
  isSelected,
  onMessageClick,
  onEditMessage,
  onDeleteMessage
}) {
  const getFileIcon = (fileType) => {
    // ... (giữ nguyên hàm getFileIcon từ code gốc)
  };

  const formatFileSize = (bytes) => {
    // ... (giữ nguyên hàm formatFileSize từ code gốc)
  };

  return (
    <div
      className={clsx("flex items-start gap-2 group message-container", {
        "justify-end": isOwnMessage,
        "justify-start": !isOwnMessage,
      })}
    >
      {!isOwnMessage && (
        <Avatar
          src={targetUser?.profilePictureUrl}
          size="xs"
          className="flex-shrink-0 mt-1"
        />
      )}

      <div className={clsx("flex items-start gap-2 max-w-[60%]", {
        "flex-row-reverse": isOwnMessage,
        "flex-row": !isOwnMessage,
      })}>
        {isOwnMessage && !msg.deleted && (
          <div className="flex items-center group-hover:opacity-100 transition-opacity duration-200 mt-1 flex-shrink-0">
            <button
              onClick={() => onMessageClick(msg)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative">
          {/* ... (phần nội dung tin nhắn giữ nguyên từ code gốc) */}
        </div>
      </div>
    </div>
  );
}