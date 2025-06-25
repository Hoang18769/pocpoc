"use client";

import { useState, useRef } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import {
  MoreVertical, Edit, Trash2, Download, Eye,
  FileText, Image, Film, Music, X, Maximize2
} from "lucide-react";
import Avatar from "../ui-components/Avatar";

// Helper
const getFilename = (msg) => msg.attachmentName || "File đính kèm";
const getFileTypeFromUrl = (url) => {
  if (!url) return "application/octet-stream";
  const ext = url.split(".").pop()?.toLowerCase();
  const mime = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
    pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain", zip: "application/zip", rar: "application/x-rar-compressed",
    mp4: "video/mp4", mp3: "audio/mpeg", wav: "audio/wav",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  };
  return mime[ext] || "application/octet-stream";
};

const isImageFile = (t) => t?.startsWith("image/");
const isVideoFile = (t) => t?.startsWith("video/");
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(1)} ${units[unit]}`;
};

const formatTime = (t) => dayjs(t).format("HH:mm");
const fullTime = (t) => dayjs(t).format("HH:mm · DD/MM/YYYY");

const FileIcon = ({ fileType }) => {
  if (isImageFile(fileType)) return <Image className="w-5 h-5" />;
  if (isVideoFile(fileType)) return <Film className="w-5 h-5" />;
  if (fileType?.startsWith("audio/")) return <Music className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
};

export default function MessageItem({
  msg,
  targetUser,
  selectedMessage,
  onMessageClick,
  onEditMessage,
  onDeleteMessage,
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
              if (e.target === videoRef.current) handlePreviewClick(url, fileType);
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
      <div className="flex items-center gap-2 p-2 bg-[var(--card)] rounded-lg">
        <FileIcon fileType={fileType} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-[var(--foreground)]">{filename}</div>
          {size && <div className="text-xs opacity-70 text-[var(--muted-foreground)]">{formatFileSize(size)}</div>}
        </div>
        <a
          href={url}
          download={filename}
          className="p-1 rounded hover:bg-[var(--accent)] text-[var(--foreground)]"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  };

  return (
    <>
      <div className={clsx("flex items-start gap-1 group", {
        "flex-row-reverse justify-end": isSelf,
        "flex-row justify-start": !isSelf,
      })}>
        {!isSelf && (
          <Avatar
            src={targetUser?.profilePictureUrl}
            size="xs"
            className="flex-shrink-0 mt-1"
          />
        )}

        <div className={clsx("flex items-end gap-1 max-w-[80%]", {
          "flex-row-reverse": isSelf,
          "flex-row": !isSelf,
        })}>
          {/* Bubble */}
          <div className="relative">
            <div
              className={clsx(
                "rounded-xl px-3 py-2 text-sm inline-block",
                msg.deleted
                  ? "bg-gray-200 text-gray-500 italic dark:bg-gray-700 dark:text-gray-400"
                  : isSelf
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--muted)] text-[var(--foreground)]"
              )}
              style={{ wordBreak: "break-word", whiteSpace: "pre-wrap", maxWidth: "100%" }}
            >
              {msg.deleted ? (
                "Tin nhắn đã bị thu hồi"
              ) : msg.attachment ? (
                renderFileInfo(msg.attachment, getFileTypeFromUrl(msg.attachment), getFilename(msg))
              ) : msg.attachedFile ? (
                renderFileInfo(
                  msg.attachedFile.url,
                  msg.attachedFile.contentType,
                  msg.attachedFile.originalFilename || getFilename(msg),
                  msg.attachedFile.size
                )
              ) : (
                msg.content
              )}

              {msg.edited && !msg.deleted && (
                <div className={clsx("text-xs mt-1 opacity-70", isSelf ? "text-[var(--primary-foreground)] opacity-80" : "text-[var(--muted-foreground)]")}>
                  <Edit className="w-3 h-3 inline mr-1" />
                  <span>đã chỉnh sửa</span>
                </div>
              )}
            </div>

            {isSelected && isSelf && !msg.deleted && (
              <div className="absolute top-0 left-0 transform -translate-x-full -translate-y-1 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] p-1 z-10 min-w-[100px]">
                {!msg.attachedFile && !msg.attachment && (
                  <button
                    onClick={() => onEditMessage(msg)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] rounded w-full text-left"
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

          {/* Thời gian */}
          <span
            className={clsx(
              "text-xs opacity-60 mt-1 select-none",
              isSelf ? "text-[var(--primary-foreground)] mr-1" : "text-[var(--muted-foreground)] ml-1"
            )}
            title={fullTime(msg.sentAt)}
          >
            {formatTime(msg.sentAt)}
          </span>
        </div>
      </div>

      {/* Modal xem ảnh/video */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setModalOpen(false); }} className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isImageFile(currentFileType) ? (
              <img src={currentFile} alt="Xem phóng to" className="max-w-full max-h-full object-contain" />
            ) : isVideoFile(currentFileType) ? (
              <video controls autoPlay className="max-w-full max-h-full">
                <source src={currentFile} type={currentFileType} />
              </video>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
