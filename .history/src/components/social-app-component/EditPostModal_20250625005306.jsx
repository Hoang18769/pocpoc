"use client";

import { useState, useRef, useEffect } from "react";
import Modal from "../ui-components/Modal";
import ImagePreview from "../ui-components/imagePreview";
import toast from "react-hot-toast";
import api from "@/utils/axios";

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const fileInputRef = useRef(null);
  const [newContent, setNewContent] = useState(post?.content || "");
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC");
  const [media, setMedia] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      console.log("Post data:", post);
      setNewContent(post.content || "");
      setNewPrivacy(post.privacy || "PUBLIC");
      // Map existing files into uniform { id, url, type } format
      setMedia(
        post.files?.map((file) => ({
          id: file.id,
          url: file.url,
          type: file.type?.startsWith("video") ? "video" : "image",
        })) || []
      );
    }
  }, [post]);

  const handleClickUploadArea = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
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
        .filter((m) => m.file) // chỉ file mới
        .forEach((m) => formData.append("files", m.file));
      const res = await api.put(`/v1/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200) {
        toast.success("Cập nhật bài viết thành công!");
        onPostUpdated?.({
          ...post,
          content: newContent,
          privacy: newPrivacy,
          files: media.filter((m) => !m.id || !removedFileIds.includes(m.id)),
        });
        onClose();
      } else {
        toast.error(res.data.message || "Lỗi khi lưu bài viết!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối hoặc máy chủ.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="large" onClose={onClose}>
      <div className="p-6 w-full max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Chỉnh sửa bài viết</h2>

        <textarea
          className="w-full p-3 border rounded bg-[var(--background)] text-[var(--foreground)]"
          rows={4}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Nhập nội dung bài viết..."
        />

        <select
          className="w-full p-3 mt-3 border rounded bg-[var(--input)] text-[var(--foreground)]"
          value={newPrivacy}
          onChange={(e) => setNewPrivacy(e.target.value)}
        >
          <option value="PUBLIC">🌍 Công khai</option>
          <option value="FRIEND">👥 Bạn bè</option>
          <option value="PRIVATE">🔒 Chỉ mình tôi</option>
        </select>

        {/* Media preview */}
        <div className="mt-4">
          {/* <ImagePreview images={media} onDelete={handleRemoveMedia} onAdd={handleClickUploadArea} /> */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            hidden
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-[var(--foreground)]"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
