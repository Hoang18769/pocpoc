"use client";

import Image from "next/image";
import { X, Maximize2, Plus } from "lucide-react";
import { useRef } from "react";

const isVideo = (src) =>
  typeof src === "string" ? src.match(/\.(mp4|webm|ogg)$/i) : false;

export default function ImagePreview({
  oldFiles = [], // mảng URL string file cũ
  newFiles = [], // mảng File mới
  onRemoveOldFile,
  onRemoveNewFile,
  onAddNewFiles,
  onImageClick,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddNewFiles?.(files);
    }
    e.target.value = null;
  };

  // Tổng số media để tính grid
  const totalItems = oldFiles.length + newFiles.length + 1;
  const gridCols =
    totalItems <= 1
      ? "grid-cols-1"
      : totalItems === 2
      ? "grid-cols-2"
      : totalItems <= 4
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-2 mt-2`}>
      {/* Hiển thị file cũ (URL string) */}
      {oldFiles.map((url, index) => {
        const type = isVideo(url) ? "video" : "image";
        return (
          <div
            key={"old-" + index}
            className="relative aspect-square rounded-lg overflow-hidden group bg-muted"
          >
            {type === "video" ? (
              <video src={url} controls className="object-cover w-full h-full" />
            ) : (
              <Image
                src={url}
                alt={`Ảnh cũ ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                onClick={() => onImageClick?.("old", index)}
                className="p-2 bg-white/80 rounded-full hover:bg-white"
                title="Xem lớn"
              >
                <Maximize2 className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={() => onRemoveOldFile?.(url)}
                className="p-2 bg-white/80 rounded-full hover:bg-white"
                title="Xóa ảnh cũ"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Hiển thị file mới (File object) */}
      {newFiles.map((file, index) => {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith("video/") ? "video" : "image";
        return (
          <div
            key={"new-" + index}
            className="relative aspect-square rounded-lg overflow-hidden group bg-muted"
          >
            {type === "video" ? (
              <video src={url} controls className="object-cover w-full h-full" />
            ) : (
              <Image
                src={url}
                alt={`Ảnh mới ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                onClick={() => onImageClick?.("new", index)}
                className="p-2 bg-white/80 rounded-full hover:bg-white"
                title="Xem lớn"
              >
                <Maximize2 className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={() => onRemoveNewFile?.(file)}
                className="p-2 bg-white/80 rounded-full hover:bg-white"
                title="Xóa ảnh mới"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Nút thêm file */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="aspect-square rounded-lg flex items-center justify-center border border-dashed border-muted-foreground hover:bg-muted transition"
        title="Thêm ảnh hoặc video"
        type="button"
      >
        <Plus className="w-6 h-6 text-muted-foreground" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
