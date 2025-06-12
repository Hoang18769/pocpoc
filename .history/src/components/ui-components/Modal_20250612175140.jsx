"use client"

import { X } from "lucide-react"
import React, { useEffect } from "react"

export default function Modal({ isOpen, onClose, children }) {
  // ESC để đóng modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden" // 🚫 Ngăn cuộn nền
    }

    return () => {
      window.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "" // ✅ Khôi phục khi đóng modal
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay mờ & chặn click */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-muted-foreground hover:text-foreground z-20"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Nội dung modal */}
      <div
        className="relative z-10 w-full max-w-5xl h-[90vh] md:h-[90vh] rounded-xl bg-[var(--card)] text-[var(--card-foreground)] shadow-xl overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()} // ⛔ Chặn lan click
      >
        {children}
      </div>
    </div>
  )
}
