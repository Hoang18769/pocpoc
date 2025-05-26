"use client";

import React from "react";

export default function NewPostModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      {/* Overlay để click ra ngoài tắt modal */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Nội dung modal */}
      <div className="relative z-10 bg-[var(--card)] text-[var(--card-foreground)] w-[90%] max-w-md rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">New post</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-[var(--foreground)]"
          >
            ➜
          </button>
        </div>

        {/* Khu vực kéo thả/chọn ảnh */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg p-10 text-gray-500 hover:border-[var(--primary)] cursor-pointer transition-colors">
          <p className="mb-2 text-sm">Choose file or drop photos here</p>
          <div className="text-4xl">🖼️ ▶️</div>
          <div className="text-2xl mt-2">+</div>
        </div>
      </div>
    </div>
  );
}
