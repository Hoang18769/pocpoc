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

  const handleDeleteClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(index);
  };

  const handleImageClick = (e, index) => {
    // Kiểm tra nếu click vào nút delete thì không zoom
    if (e.target.closest('[data-delete-button]')) {
      return;
    }
    onImageClick?.(index);
  };

  return (
    <div className={`grid ${gridCols} gap-2 mt-2`}>
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            aspectRatio: '1',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer'
          }}
          className="group"
          onClick={(e) => handleImageClick(e, index)}
        >
          {img.type === "video" ? (
            <video 
              src={img.preview} 
              className="object-cover w-full h-full"
              muted
            />
          ) : (
            <Image
              src={img.preview}
              alt={`Post image ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
          )}

          {/* Overlay tối khi hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200"></div>

          {/* Nút X với styling tuyệt đối */}
          <button
            data-delete-button="true"
            onClick={(e) => handleDeleteClick(e, index)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '32px',
              height: '32px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.transform = 'scale(1)';
            }}
            title="Xóa ảnh/video"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Indicator cho video */}
          {img.type === "video" && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              📹 Video
            </div>
          )}
        </div>
      ))}

      {/* Nút thêm */}
      <button
        onClick={onAdd}
        style={{
          aspectRatio: '1',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #d1d5db',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.backgroundColor = '#eff6ff';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.backgroundColor = 'transparent';
        }}
        title="Thêm ảnh hoặc video"
        type="button"
      >
        <Plus style={{ width: '24px', height: '24px', color: '#9ca3af', marginBottom: '4px' }} />
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Thêm</span>
      </button>
    </div>
  );
}