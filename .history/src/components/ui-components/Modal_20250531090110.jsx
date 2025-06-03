"use client";

import { X } from "lucide-react";
import React, { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {
  // ESC để đóng modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
     <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground z-20"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      {/* Overlay click ra ngoài để đóng */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Nội dung modal toàn màn hình với max width */}
      <div
        className="relative z-10 w-full max-w-5xl h-[90vh] md:h-[90vh] rounded-xl bg-[var(--card)] text-[var(--card-foreground)] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >       
        {children}
      </div>
    </div>
  );
}
