"use client"

import Image from "next/image"
import { X, Maximize2, Plus } from "lucide-react"

export default function ImagePreview({ images = [], onImageClick, onDelete, onAdd }) {
  if (!Array.isArray(images)) return null

  const gridCols =
    images.length === 1 ? "grid-cols-1" :
    images.length === 2 ? "grid-cols-2" :
    images.length === 3 ? "grid-cols-3" :
    "grid-cols-4"

  return (
    <div className={`grid ${gridCols} gap-2 mt-2`}>
      {images.map((img, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden group bg-muted"
        >
          <Image
            src={img.preview}
            alt={`Post image ${index + 1}`}
            fill
            unoptimized
            className="object-cover"
          />

          {/* Overlay buttons */}
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
      ))}

      {/* Nút thêm ảnh */}
      {onAdd && (
        <button
          onClick={onAdd}
          className="aspect-square rounded-lg flex items-center justify-center border border-dashed border-muted-foreground hover:bg-muted transition"
          title="Thêm ảnh"
        >
          <Plus className="w-6 h-6 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}
