"use client";

import Image from "next/image";
import { X, Plus } from "lucide-react";

export default function ImagePreview({ images = [], onDelete, onAdd, onImageClick }) {
  if (!Array.isArray(images)) return null;

  const totalItems = images.length + 1;
  const gridCols =
    totalItems <= 1 ? "grid-cols-1" :
    totalItems === 2 ? "grid-cols-2" :
    totalItems <= 4 ? "grid-cols-3" :
    "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-2 mt-2`}>
      {images.map((img, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
          onClick={() => onImageClick?.(index)}
        >
          {img.type === "video" ? (
            <video src={img.preview} className="object-cover w-full h-full" />
          ) : (
            <Image
              src={img.preview}
              alt={`Post image ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
          )}

          {/* Nút X luôn luôn hiện */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // chặn không cho zoom
              onDelete?.(index);
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition"
            title="Xóa"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
      ))}

      {/* Nút thêm */}
      <button
        onClick={onAdd}
        className="aspect-square rounded-lg flex items-center justify-center border border-dashed border-muted-foreground hover:bg-muted transition"
        title="Thêm ảnh hoặc video"
        type="button"
      >
        <Plus className="w-6 h-6 text-muted-foreground" />
      </button>
    </div>
  );
}
