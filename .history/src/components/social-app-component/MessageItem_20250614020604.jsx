import { useState } from "react";
import clsx from "clsx";
import {
  MoreVertical, Edit, Trash2, Download, Eye,
  FileText, Image, Film, Music, X
} from "lucide-react";
import Avatar from "../ui-components/Avatar";

// Helper functions
const getFilenameFromUrl = (url) => {
  if (!url) return 'Unknown file';
  const match = url.match(/\/([^\/]+\.(png|jpg|jpeg|gif|pdf|doc|docx|txt|zip|rar|mp4|mp3|wav|xlsx|ppt|pptx))/i);
  return match?.[1] || url.split('/').pop() || 'File đính kèm';
};

const getFileTypeFromUrl = (url) => {
  if (!url) return 'application/octet-stream';
  const extension = url.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'gif': 'image/gif', 'webp': 'image/webp',
    'pdf': 'application/pdf', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain', 'zip': 'application/zip', 'rar': 'application/x-rar-compressed',
    'mp4': 'video/mp4', 'mp3': 'audio/mpeg', 'wav': 'audio/wav',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint', 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

const isImageFile = (fileType) => fileType?.startsWith('image/');
const isVideoFile = (fileType) => fileType?.startsWith('video/');

const formatFileSize = (bytes) => {
  if (!bytes) return '';
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
  if (isImageFile(fileType)) return <Image className="w-5 h-5" />;
  if (isVideoFile(fileType)) return <Film className="w-5 h-5" />;
  if (fileType?.startsWith('audio/')) return <Music className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
};

export default function MessageItem({
  msg,
  targetUser,
  selectedMessage,
  onMessageClick,
  onEditMessage,
  onDeleteMessage
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentFileType, setCurrentFileType] = useState(null);

  const isSelf = msg.sender?.id !== targetUser?.id;
  const isSelected = selectedMessage === msg.id;

  const handlePreviewClick = (url, fileType) => {
    setCurrentFile(url);
    setCurrentFileType(fileType);
    setModalOpen(true);
  };

  const renderMediaPreview = (url, fileType) => {
    if (isImageFile(fileType)) {
      return (
        <div
          className="cursor-pointer rounded-lg overflow-hidden"
          onClick={() => handlePreviewClick(url, fileType)}
        >
          <img
            src={url}
            alt="Preview"
            className="max-w-full max-h-64 object-contain rounded-lg border border-[var(--border)]"
          />
        </div>
      );
    } else if (isVideoFile(fileType)) {
      return (
        <div
          className="cursor-pointer rounded-lg overflow-hidden"
          onClick={() => handlePreviewClick(url, fileType)}
        >
          <video
            className="max-w-full max-h-64 rounded-lg border border-[var(--border)]"
            poster={url.replace(/\.[^/.]+$/, '.jpg')}
          >
            <source src={url} type={fileType} />
          </video>
        </div>
      );
    }
    return null;
  };

  const renderFileInfo = (url, fileType, filename, size) => {
    if (isImageFile(fileType) || isVideoFile(fileType)) {
      return renderMediaPreview(url, fileType);
    }

    return (
      <div className="flex items-center gap-2 p-2 rounded-lg">
        <FileIcon fileType={fileType} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{filename}</div>
          {size && <div className="text-xs opacity-70">{formatFileSize(size)}</div>}
        </div>
        <a href={url} download className="p-1 rounded hover:bg-black/10">
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  };

  return (
    <>
      <div className={clsx("flex items-start gap-2 group", {
        "justify-end": isSelf,
        "justify-start": !isSelf,
      })}>
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
          <div className="relative flex items-start gap-1">
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
                renderFileInfo(
                  msg.attachment,
                  getFileTypeFromUrl(msg.attachment),
                  getFilenameFromUrl(msg.attachment)
                )
              ) : msg.attachedFile ? (
                renderFileInfo(
                  msg.attachedFile.url,
                  msg.attachedFile.contentType,
                  msg.attachedFile.originalFilename,
                  msg.attachedFile.size
                )
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

            {isSelf && !msg.deleted && (
              <div className="relative">
                <button
                  onClick={() => onMessageClick(msg)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isSelected && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10 min-w-[100px]">
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
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            {isImageFile(currentFileType) ? (
              <img
                src={currentFile}
                alt="Xem phóng to"
                className="max-w-full max-h-full object-contain"
              />
            ) : isVideoFile(currentFileType) ? (
              <video
                controls
                autoPlay
                className="max-w-full max-h-full"
              >
                <source src={currentFile} type={currentFileType} />
              </video>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
