"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/ui-components/Modal";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export default function NewPostModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]); // Array of { file, preview }
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [content, setContent] = useState("");
  const token = localStorage.getItem("accessToken");

  const handleFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/")
    );
    const mapped = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const handleImageSelect = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!images.length || !content || !privacy) return;

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

      // Reset modal
      onClose();
      setImages([]);
      setContent("");
      setPrivacy("PUBLIC");
    } catch (err) {
      console.error("❌ Error posting:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative bg-[var(--card)] p-4 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">New post</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Upload area */}
        <div
          onClick={handleClickUploadArea}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full border-2 border-dashed border-[var(--border)] rounded-md px-6 py-10 text-center text-gray-500 hover:border-[var(--primary)] cursor-pointer transition mb-4"
        >
          <p className="text-sm">Choose or drop photos here</p>
          <div className="text-4xl">🖼️</div>
          <div className="text-2xl">+</div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            hidden
            multiple
          />
        </div>

        {/* Preview Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded overflow-hidden border border-[var(--border)]"
              >
                <Image
                  src={img.preview}
                  alt={`Preview ${index}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full hover:bg-opacity-75 transition"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Privacy</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)]"
            >
              <option value="PUBLIC">🌍 Public</option>
              <option value="FRIEND">👥 Friends</option>
              <option value="PRIVATE">🔒 Only me</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Caption</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write something..."
              className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)] resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
