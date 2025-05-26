"use client";

import React from "react";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      {/* Overlay để click ra ngoài tắt modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Nội dung modal */}
      <div
        className="relative z-10 bg-[var(--card)] text-[var(--card-foreground)] w-[90%] max-w-md rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click vào overlay
      >
        {children}
      </div>
    </div>
  );
}
