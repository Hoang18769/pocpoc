"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "../ui-components/Modal";
import ImagePreview from "../ui-components/ImagePreview";
import toast from "react-hot-toast";
import api from "@/utils/axios";

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const [newContent, setNewContent] = useState(post?.content || "");
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC");

  // Quản lý file cũ (URL string)
  const [oldFiles, setOldFiles] = useState(post?.files || []);

  // Quản lý file mới (File object)
  const [newFiles, setNewFiles] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setNewContent(post.content || "");
      setNewPrivacy(post.privacy || "PUBLIC");
      setOldFiles(post.files || []);
      setNewFiles([]);
    }
  }, [post]);

  // Xóa file cũ (URL)
  const handleRemoveOldFile = (url) => {
    setOldFiles((prev) => prev.filter((item) => item !== url));
  };

  // Xóa file mới (File object)
  const handleRemoveNewFile = (file) => {
    setNewFiles((prev) => prev.filter((item) => item !== file));
  };

  // Thêm file mới (FileList hoặc mảng File)
  const handleAddNewFiles = (files) => {
    const filesArray = Array.from(files);
    setNewFiles((prev) => [...prev, ...filesArray]);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", newContent);
      formData.append("privacy", newPrivacy);

      // Gửi danh sách URL file cũ còn giữ lại (tuỳ backend hỗ trợ)
      oldFiles.forEach((url) => formData.append("existingFiles", url));

      // Gửi file mới
      newFiles.forEach((file) => formData.append("files", file));

      const res = await api.put(`/v1/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200) {
        toast.success("Cập nhật bài viết thành công!");
        // Cập nhật lại post với dữ liệu mới
        onPostUpdated?.({
          ...post,
          content: newContent,
          privacy: newPrivacy,
          files: oldFiles.concat(
            newFiles.map((file) => URL.createObjectURL(file)) // tạm thời dùng preview local
          ),
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

        <div className="mt-4">
          <ImagePreview
            oldFiles={oldFiles}
            newFiles={newFiles}
            onRemoveOldFile={handleRemoveOldFile}
            onRemoveNewFile={handleRemoveNewFile}
            onAddNewFiles={handleAddNewFiles}
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
