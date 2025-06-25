import { useState, useRef } from "react";
import clsx from "clsx";
import {
  MoreVertical, Edit, Trash2, Download, Eye,
  FileText, Image, Film, Music, X, Maximize2
} from "lucide-react";
import Avatar from "../ui-components/Avatar";

// Helper functions (giữ nguyên)
// ...

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
  const videoRef = useRef(null);
  
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
        <div className="relative group">
          <video
            ref={videoRef}
            controls
            className="max-w-full max-h-64 rounded-lg border border-[var(--border)]"
            onClick={(e) => {
              // Ngăn modal mở khi click vào controls video
              if (e.target === videoRef.current) {
                handlePreviewClick(url, fileType);
              }
            }}
          >
            <source src={url} type={fileType} />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
          <button
            onClick={() => handlePreviewClick(url, fileType)}
            className="absolute bottom-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Xem phóng to"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
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
        
      </div>

      {/* Modal xem phóng to */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
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