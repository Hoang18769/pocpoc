"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/ui-components/Modal";
import Image from "next/image";

export default function NewPostModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [step, setStep] = useState("upload"); // "upload" | "form"
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [content, setContent] = useState("");
  const token=localStorage.getItem("accessToken")
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
    if (selectedImage) {
      setStep("form");
    }
  };

const handleSubmit = async () => {
  if (!selectedImage || !content || !privacy) return;

  const formData = new FormData();
  formData.append("content", content);
  formData.append("privacy", privacy);
  formData.append("files", selectedImage.file); // Backend expects "files" key

  try {
    const res = await fetch("http://localhost:80/v1/posts/post", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Thay bằng token thực tế
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    console.log("✅ Post success:", data);
    onClose();

    // Reset modal state
    setSelectedImage(null);
    setStep("upload");
    setContent("");
    setPrivacy("PUBLIC");
  } catch (err) {
    console.error("❌ Error posting:", err);
  }
};


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">New post</h2>
        <button
          onClick={onClose}
          className="text-xl text-gray-400 hover:text-[var(--foreground)]"
        >
          ✕
        </button>
      </div>

      {step === "upload" ? (
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

          {selectedImage && (
            <button
              onClick={handleNext}
              className="mt-6 px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition"
            >
              Next
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: Image Preview */}
          <div className="md:w-1/2 w-full aspect-square relative rounded-md overflow-hidden border">
            <Image
              src={selectedImage.preview}
              alt="Selected"
              fill
              className="object-contain"
            />
          </div>

          {/* Right: Form Inputs */}
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
      )}
    </Modal>
  );
}
