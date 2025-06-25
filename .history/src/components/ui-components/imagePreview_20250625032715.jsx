"use client";

import Image from "next/image";
import { X, Plus } from "lucide-react";
import { useRef } from "react";

export default function ImagePreview({ images = [], onImageClick, onDelete, onAdd }) {
  const fileInputRef = useRef(null);

  const handleAddClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAdd?.(files);
      e.target.value = null;
    }
  };

  if (!Array.isArray(images)) return null;

  const totalItems = images.length + 1;
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
      {images.map((img, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
          onClick={() => onImageClick?.(index)}
        >
          {img.type === "video" ? (
            <video
              src={img.preview}
              className="object-cover w-full h-full z-0"
              controls={false}
            />
          ) : (
            <Image
              src={img.preview}
              alt={`Post image ${index + 1}`}
              fill
              unoptimized
              className="object-cover z-0"
            />
          )}

          {/* Nút x luôn hiện */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(index);
            }}
            className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full z-10"
            title="Xóa"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ))}

      {/* Nút thêm */}
      <button
        onClick={handleAddClick}
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
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
