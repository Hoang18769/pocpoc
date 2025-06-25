"use client";

import { useState, useRef, useEffect } from "react";
import Modal from "../ui-components/Modal";
import ImagePreview from "../ui-components/ImagePreview";
import toast from "react-hot-toast";
import api from "@/utils/axios";

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const fileInputRef = useRef(null);

  const [newContent, setNewContent] = useState(post?.content || "");
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC");
  const [media, setMedia] = useState([]);         // chứa cả file cũ và file mới
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Convert file cũ sang dạng { preview, type, isOld, id }
  useEffect(() => {
    if (post) {
      setNewContent(post.content || "");
      setNewPrivacy(post.privacy || "PUBLIC");

      const oldFiles = (post.files || []).map((url) => ({
        preview: url,
        type: url.endsWith(".mp4") ? "video" : "image",
        isOld: true,
        id: extractFileIdFromUrl(url), // bạn tự xử lý logic lấy id file cũ nếu cần
      }));
      setMedia(oldFiles);
    }
  }, [post]);

  // Xử lý chọn file mới
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      preview: URL.createObjectURL(file),
      file,
      type: file.type.startsWith("video/") ? "video" : "image",
      isOld: false,
    }));
    setMedia((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  // Xử lý xóa file
  const handleRemoveMedia = (index) => {
    const file = media[index];
    if (file.isOld && file.id) {
      setRemovedFileIds((prev) => [...prev, file.id]);
    }
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý lưu
  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", newContent);
      formData.append("privacy", newPrivacy);

      // Các file cũ đã xóa
      removedFileIds.forEach((id) => formData.append("removedIds", id));
      // Các file mới cần thêm
      media.filter((m) => !m.isOld && m.file).forEach((m) => formData.append("files", m.file));

      const res = await api.put(`/v1/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200) {
        toast.success("Cập nhật bài viết thành công!");

        // Các file cũ không xóa
        const existingFiles = media
          .filter((m) => m.isOld && !removedFileIds.includes(m.id))
          .map((m) => m.preview); // preview cũ = URL file cũ

        // Các file mới thêm
        const newFiles = media.filter((m) => !m.isOld).map((m) => m.preview);

        onPostUpdated?.({
          ...post,
          content: newContent,
          privacy: newPrivacy,
          files: [...existingFiles, ...newFiles], // trả lại danh sách file
        });

        onClose();
      } else {
        toast.error(res.data.message || "Lỗi khi lưu bài viết!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối hoặc máy chủ.");
      console.error(error);
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
  images={media}
  onDelete={handleRemoveMedia}
  onImageClick={(index) => setZoomIndex(index)} // Xử lý zoom
  onAdd={(files) => handleFileChange({ target: { files } })}
/>


          <input
            ref={fileInputRef}
            type="file"
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

// Dummy helper nếu bạn không có id trong post.files
function extractFileIdFromUrl(url) {
  // Giả sử filename là id
  return url.split("/").pop()?.split(".")[0] || null;
}
