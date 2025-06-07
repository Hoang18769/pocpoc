"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/ui-components/Modal";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import ImageView from "../ui-components/ImageView";
import api from "@/utils/axios";
import ImagePreview from "../ui-components/imagePreview";

export default function NewPostModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [content, setContent] = useState("");

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
      const res = await api.post("/v1/posts/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
                    toas(`${data.creator.givenName} đã chấp nhận lời mời kết bạn 🤝`);

      console.log("✅ Post success:", res.data);
      onClose();

      // Reset modal
      setImages([]);
      setContent("");
      setPrivacy("PUBLIC");
    } catch (err) {
      console.error(" Error posting:", err);
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
        {images.length > 0 && (
          <div className="flex flex-col md:flex-row gap-6 p-4">
            {/* Image preview - Left (50%) */}
            <div className="md:w-1/2 w-full">
              <ImagePreview
                images={images.map((img) => img.preview)}
                onImageClick={(index) => {
                  console.log("Clicked image at index", index);
                }}
              />
            </div>

            {/* Form - Right (50%) */}
            <div className="md:w-1/2 w-full flex flex-col gap-4">
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

              <div className="flex justify-end mt-auto">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
