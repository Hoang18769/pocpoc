"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/ui-components/Modal";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import api from "@/utils/axios";
import toast from "react-hot-toast";

export default function NewPostModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const [media, setMedia] = useState([]);
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMediaSelect = (files) => {
    const mediaFiles = files.filter((file) =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    const newMedia = mediaFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setMedia((prev) => [...prev, ...newMedia]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    handleMediaSelect(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleMediaSelect(files);
  };

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (media.length === 0 || !content || !privacy || isLoading) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("privacy", privacy);
    media.forEach((item) => formData.append("files", item.file));

    try {
      const res = await api.post("/v1/posts/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.code === 200) {
        toast.success("Đăng bài thành công");
        onClose?.();
        setMedia([]);
        setContent("");
        setPrivacy("PUBLIC");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối hoặc máy chủ.");
      console.error("❌ Error posting:", err);
    } finally {
      setIsLoading(false);
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

        {/* Upload area */}
        {media.length === 0 && (
          <div
            onClick={handleClickUploadArea}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg p-10 text-gray-500 hover:border-[var(--primary)] cursor-pointer transition-colors space-y-2"
          >
            <p className="text-sm">Chọn ảnh hoặc video, hoặc kéo thả vào đây</p>
            <div className="text-4xl">📁</div>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageSelect}
              hidden
            />
          </div>
        )}

        {/* Media preview + form */}
        {media.length > 0 && (
          <div className="flex flex-col md:flex-row gap-6 p-4">
            {/* Media preview */}
            <div className="md:w-1/2 w-full grid grid-cols-2 gap-4">
              {media.map((item, i) => (
                <div key={i} className="relative group">
                  {item.type === "image" ? (
                    <Image
                      src={item.preview}
                      alt={`media-${i}`}
                      width={160}
                      height={160}
                      className="rounded object-cover w-full h-auto"
                    />
                  ) : (
                    <video
                      src={item.preview}
                      controls
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  <button
                    onClick={() => handleRemoveMedia(i)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-75"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div
                onClick={handleClickUploadArea}
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer text-gray-500 hover:border-[var(--primary)]"
              >
                +
              </div>
            </div>

            {/* Post form */}
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
                  placeholder="Viết điều gì đó..."
                  className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)] resize-none"
                />
              </div>

              <div className="flex justify-end mt-auto">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
