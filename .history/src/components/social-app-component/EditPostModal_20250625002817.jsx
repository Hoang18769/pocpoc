"use client";

import { useState, useRef } from "react";
import Modal from "../ui-components/Modal";
import ImagePreview from "../ui-components/imagePreview";
import toast from "react-hot-toast";
import api from "@/utils/axios";

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const fileInputRef = useRef(null);

  // Content & privacy
  const [newContent, setNewContent] = useState(post?.content || "");
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC");

  // Media state
  const [media, setMedia] = useState(() =>
    post.files?.map((file) => ({
      id: file.id,
      preview: file.url,
      type: file.type.startsWith("video/") ? "video" : "image",
    })) || []
  );
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClickUploadArea = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    setMedia((prev) => [...prev, ...newMedia]);
  };

  const handleRemoveMedia = (index) => {
    const file = media[index];
    if (file.id) {
      setRemovedFileIds((prev) => [...prev, file.id]);
    }
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", newContent);
      formData.append("privacy", newPrivacy);

      removedFileIds.forEach((id) => formData.append("removedIds", id));
      const newFiles = media.filter((m) => m.file); // file mới
      newFiles.forEach((m) => formData.append("files", m.file));

      const res = await api.put(`/v1/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200) {
        toast.success("Cập nhật bài viết thành công!");
        onPostUpdated?.({
          ...post,
          content: newContent,
          privacy: newPrivacy,
          files: media.filter((m) => !removedFileIds.includes(m.id)),
        });
        onClose();
      } else {
        toast.error(res.data.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối hoặc máy chủ.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // reset state
    setNewContent(post?.content || "");
    setNewPrivacy(post?.privacy || "PUBLIC");
    setMedia(
      post.files?.map((file) => ({
        id: file.id,
        preview: file.url,
        type: file.type.startsWith("video/") ? "video" : "image",
      })) || []
    );
    setRemovedFileIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="large" onClose={handleClose}>
      <div className="p-6 w-full max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Chỉnh sửa bài viết</h2>

        <div className="flex flex-col gap-4 mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)]">Nội dung bài viết</label>
          <textarea
            className="w-full p-3 border border-[var(--border)] rounded-md text-[var(--foreground)] bg-[var(--background)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Nhập nội dung bài viết..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />

          <label className="block text-sm font-medium text-[var(--foreground)]">Quyền riêng tư</label>
          <select
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newPrivacy}
            onChange={(e) => setNewPrivacy(e.target.value)}
          >
            <option value="PUBLIC">🌍 Công khai</option>
            <option value="FRIEND">👥 Bạn bè</option>
            <option value="PRIVATE">🔒 Chỉ mình tôi</option>
          </select>

          <label className="block text-sm font-medium text-[var(--foreground)]">Ảnh / Video</label>
          <ImagePreview images={media} onDelete={handleRemoveMedia} onAdd={handleClickUploadArea} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-[var(--border)] text-sm text-[var(--foreground)] hover:bg-[var(--input)] disabled:opacity-50"
          >
            ❌ Hủy
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
