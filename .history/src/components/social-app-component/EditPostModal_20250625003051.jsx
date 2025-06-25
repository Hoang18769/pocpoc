"use client";

import { useState, useRef } from "react";
import Modal from "../ui-components/Modal";
import ImagePreview from "../ui-components/imagePreview";
import toast from "react-hot-toast";
import api from "@/utils/axios";

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const fileInputRef = useRef(null);

  const [newContent, setNewContent] = useState(post?.content || "");
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC");
  const [media, setMedia] = useState(() => post.files || []); // file cũ
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClickUploadArea = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setMedia((prev) => [...prev, ...files]);
  };

  const handleRemoveMedia = (index) => {
    const file = media[index];
    if (file.id) setRemovedFileIds((prev) => [...prev, file.id]);
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", newContent);
      formData.append("privacy", newPrivacy);

      removedFileIds.forEach((id) => formData.append("removedIds", id));
      media
        .filter((m) => m.file) // file mới
        .forEach((m) => formData.append("files", m.file));

      const res = await api.put(`/v1/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200) {
        toast.success("Cập nhật bài viết thành công!");
        onPostUpdated?.({ ...post, content: newContent, privacy: newPrivacy, files: media.filter((m) => !m.id || !removedFileIds.includes(m.id)) });
        onClose();
      } else {
        toast.error(res.data.message || "Lỗi khi lưu bài viết");
      }
    } catch (err) {
      toast.error("Lỗi kết nối hoặc máy chủ.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewContent(post?.content || "");
    setNewPrivacy(post?.privacy || "PUBLIC");
    setMedia(post.files || []);
    setRemovedFileIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="large" onClose={handleClose}>
      <div className="p-6 w-full max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Chỉnh sửa bài viết</h2>

        <div className="flex flex-col gap-4">
          <textarea
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Nhập nội dung bài viết..."
          />

          <select
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--foreground)] focus:ring-2 focus:ring-blue-500"
            value={newPrivacy}
            onChange={(e) => setNewPrivacy(e.target.value)}
          >
            <option value="PUBLIC">🌍 Công khai</option>
            <option value="FRIEND">👥 Bạn bè</option>
            <option value="PRIVATE">🔒 Chỉ mình tôi</option>
          </select>

          {/* Preview ảnh/video */}
          <ImagePreview images={media} onDelete={handleRemoveMedia} onAdd={handleClickUploadArea} />

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            hidden
            onChange={handleFileChange}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--input)]"
            >
              ❌ Hủy
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Đang lưu..." : "💾 Lưu"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
