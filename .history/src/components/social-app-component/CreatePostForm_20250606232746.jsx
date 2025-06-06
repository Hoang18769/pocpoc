"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/ui-components/Modal";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import ImageView from "../ui-components/ImageView";

export default function NewPostModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [content, setContent] = useState("");
  const token = localStorage.getItem("accessToken");

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const newImages = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const newImages = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0 || !content || !privacy) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("privacy", privacy);
    images.forEach((img) => formData.append("files", img.file));

    try {
      const res = await fetch("http://localhost:80/v1/posts/post", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log("✅ Post success:", data);
      onClose();

      // Reset modal
      setImages([]);
      setContent("");
      setPrivacy("PUBLIC");
    } catch (err) {
      console.error("❌ Error posting:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-semibold">New post</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Upload area (only when no images yet) */}
        {images.length === 0 && (
          <div
            onClick={handleClickUploadArea}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg p-10 text-gray-500 hover:border-[var(--primary)] cursor-pointer transition-colors space-y-2"
          >
            <p className="text-sm">Choose file or drop photos here</p>
            <div className="text-4xl">🖼️</div>
            <div className="text-2xl">+</div>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageSelect}
              hidden
            />
          </div>
        )}

        {/* If images selected: show preview + form */}
        <ImageView
  images={images.map((img) => img.preview)}
  onImageClick={(index) => {
    // Optional: you can show a full-screen preview or lightbox here
    console.log("Clicked image at index", index);
  }}
/>

      </div>
    </Modal>
  );
}
