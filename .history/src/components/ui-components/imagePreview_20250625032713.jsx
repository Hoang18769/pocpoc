"use client";

import Image from "next/image";
import { X, Plus } from "lucide-react";
import { useRef } from "react";

export default function ImagePreview({ images = [], onImageClick, onDelete, onAdd }) {
  const fileInputRef = useRef(null);

  const handleAddClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onAdd?.(files);
    e.target.value = null;
  };

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
          className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
          onClick={() => onImageClick?.(index)} // click preview => zoom
        >
          {img.type === "video" ? (
            <video src={img.preview} className="w-full h-full object-cover" controls={false} />
          ) : (
            <Image src={img.preview} alt={`Media ${index + 1}`} fill className="object-cover" />
          )}

          {/* Nút X luôn hiển thị */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // chặn event click để không chạy onImageClick
              onDelete?.(index);
            }}
            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
            title="Xóa"
          >
            <X className="w-4 h-4" />
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
