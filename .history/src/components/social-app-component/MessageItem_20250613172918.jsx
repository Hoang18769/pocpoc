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
            poster={url.replace(/\.[^/.]+$/, '.jpg')} // Thumbnail for video
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
      <div className={clsx("flex items-start gap-2 group message-container", {
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
          
      </div>

      {/* Modal xem phóng to */}
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