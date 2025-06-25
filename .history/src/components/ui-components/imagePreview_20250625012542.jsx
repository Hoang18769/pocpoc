"use client";

import Image from "next/image";
import { X, Maximize2, Plus } from "lucide-react";
import { useRef } from "react";

const isVideo = (src) =>
  typeof src === "string" ? src.match(/\.(mp4|webm|ogg)$/i) : false;

export default function ImagePreview({ images = [], onDelete, onAdd, onImageClick }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAdd?.(files); // Gửi file raw lên parent
    }
    e.target.value = null;
  };

  const previewSrc = (img) => img.preview || img.url;

  if (!Array.isArray(images)) return null;

  const totalItems = images.length + 1;
  const gridCols =
    totalItems <= 1 ? "grid-cols-1"
      : totalItems === 2 ? "grid-cols-2"
      : totalItems <= 4 ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-2 mt-2`}>
      {images.map((img, index) => {
        const src = {};
        const type = img.type || (isVideo(src) ? "video" : "image");

        return (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group bg-muted">
            {type === "video" ? (
              <video
                src={src}
                controls
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src={src}
                alt={`Media ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                onClick={() => onImageClick?.(index)}
                className="p-2 bg-white/80 rounded-full hover:bg-white"
                title="Xem lớn"
              >
                <Maximize2 className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={() => onDelete?.(index)}
                className="p-2 bg-white/80 rounded-full hover:bg-white"
                title="Xóa"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        );
      })}

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
    </div>
  );
}
