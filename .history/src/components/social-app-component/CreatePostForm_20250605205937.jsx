"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/ui-components/Modal";
import Image from "next/image";

export default function NewPostModal({ isOpen, onClose, onNext }) {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const handleNext = () => {
    if (selectedImage && onNext) {
      onNext(selectedImage); // truyền ảnh sang modal tiếp theo
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">New post</h2>
        <button
          onClick={onClose}
          className="text-xl text-gray-400 hover:text-[var(--foreground)]"
        >
          ✕
        </button>
      </div>

      {selectedImage ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full aspect-square relative rounded-md overflow-hidden">
            <Image
              src={selectedImage.preview}
              alt="Selected"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={handleNext}
            className="mt-4 px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition"
          >
            Next
          </button>
        </div>
      ) : (
        <div
          onClick={handleClickUploadArea}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg p-10 text-gray-500 hover:border-[var(--primary)] cursor-pointer transition-colors"
        >
          <p className="mb-2 text-sm">Choose file or drop photos here</p>
          <div className="text-4xl">🖼️</div>
          <div className="text-2xl mt-2">+</div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            hidden
          />
        </div>
      )}
    </Modal>
  );
}
