"use client";

import React from "react";
import Modal from "@/components/ui-components/Modal";

export default function NewPostModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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

      {/* Khu vực upload */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg p-10 text-gray-500 hover:border-[var(--primary)] cursor-pointer transition-colors">
        <p className="mb-2 text-sm">Choose file or drop photos here</p>
        <div className="text-4xl">🖼️ ▶️</div>
        <div className="text-2xl mt-2">+</div>
      </div>
    </Modal>
  );
}
