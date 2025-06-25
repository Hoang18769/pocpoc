import { useState } from "react";
import clsx from "clsx";
import {
  MoreVertical, Edit, Trash2, Download, Eye,
  FileText, Image, Film, Music
} from "lucide-react";
import Avatar from "../ui-components/Avatar";

// Helper functions
const getFilenameFromUrl = (url) => {
  if (!url) return 'Unknown file';
  const match = url.match(/\/([^\/]+\.(png|jpg|jpeg|gif|pdf|doc|docx|txt|zip|rar|mp4|mp3|wav|xlsx|ppt|pptx))/i);
  if (match) {
    return match[1];
  }
  const segments = url.split('/');
  const lastSegment = segments[segments.length - 1];
  if (lastSegment.includes('.')) {
    return lastSegment;
  }
  return 'File đính kèm';
};

const getFileTypeFromUrl = (url) => {
  if (!url) return 'application/octet-stream';
  const extension = url.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

const isImageFile = (url) => {
  if (!url) return false;
  const extension = url.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
};

const isVideoFile = (url) => {
  if (!url) return false;
  const extension = url.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'ogg'].includes(extension);
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const FileIcon = ({ fileType }) => {
  if (!fileType) return <FileText className="w-8 h-8" />;
  if (fileType.startsWith('image/')) return <Image className="w-8 h-8" />;
  if (fileType.startsWith('video/')) return <Film className="w-8 h-8" />;
  if (fileType.startsWith('audio/')) return <Music className="w-8 h-8" />;
  return <FileText className="w-8 h-8" />;
};

export default function MessageItem({ 
  msg, 
  targetUser, 
  selectedMessage, 
  onMessageClick, 
  onEditMessage, 
  onDeleteMessage 
}) {
  const isSelf = msg.sender?.id !== targetUser?.id;
  const isSelected = selectedMessage === msg.id;

  const renderFilePreview = (url, fileType) => {
    if (fileType.startsWith('image/')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden">
          <img 
            src={url} 
            alt="Preview" 
            className="max-w-full max-h-64 object-contain rounded-lg border border-[var(--border)]"
          />
        </div>
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden">
          <video 
            controls
            className="max-w-full max-h-64 rounded-lg border border-[var(--border)]"
          >
            <source src={url} type={fileType} />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
      );
    }
    return null;
  };

  const renderFileInfo = (url, fileType, filename, size) => {
    return (
      <div className="flex items-center gap-2 min-w-[200px]">
        <FileIcon fileType={fileType} />
        <div className="flex-1">
          <div className="font-medium">{filename}</div>
          {size && (
            <div className="text-xs opacity-70">
              {formatFileSize(size)}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {(fileType.startsWith('image/') || fileType.startsWith('video/')) && (
            <button 
              className="p-1 rounded hover:bg-black/10"
              onClick={() => window.open(url, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <a 
            href={url} 
            download
            className="p-1 rounded hover:bg-black/10"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div
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

      <div className={clsx("flex items-start gap-2 max-w-[80%]", {
        "flex-row-reverse": isSelf,
        "flex-row": !isSelf,
      })}>
        {isSelf && !msg.deleted && (
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
          <div
            className={clsx(
              "rounded-xl px-3 py-2 text-sm inline-block",
              msg.deleted
                ? "bg-gray-200 text-gray-500 italic dark:bg-gray-700 dark:text-gray-400"
                : isSelf
                ? "bg-blue-500 text-white"
                : "bg-[var(--muted)] text-[var(--foreground)]"
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
              <>
                {renderFileInfo(
                  msg.attachment, 
                  getFileTypeFromUrl(msg.attachment), 
                  getFilenameFromUrl(msg.attachment)
                )}
                {renderFilePreview(
                  msg.attachment, 
                  getFileTypeFromUrl(msg.attachment)
                )}
              </>
            ) : msg.attachedFile ? (
              <>
                {renderFileInfo(
                  msg.attachedFile.url, 
                  msg.attachedFile.contentType, 
                  msg.attachedFile.originalFilename,
                  msg.attachedFile.size
                )}
                {renderFilePreview(
                  msg.attachedFile.url, 
                  msg.attachedFile.contentType
                )}
              </>
            ) : (
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
              {!msg.attachedFile && !msg.attachment && (
                <button
                  onClick={() => onEditMessage(msg)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
              )}
              <button
                onClick={() => onDeleteMessage(msg.id)}
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
}