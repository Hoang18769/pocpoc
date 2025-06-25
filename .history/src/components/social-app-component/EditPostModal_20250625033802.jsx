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
  const [media, setMedia] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(null);

  useEffect(() => {
    if (post) {
      setNewContent(post.content || "");
      setNewPrivacy(post.privacy || "PUBLIC");
      const oldFiles = (post.files || []).map((url) => ({
        preview: url,
        type: url.endsWith(".mp4") ? "video" : "image",
        isOld: true,
        id: extractFileIdFromUrl(url),
      }));
      setMedia(oldFiles);
    }
  }, [post]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      isOld: false,
    }));
    setMedia((prev) => [...prev, ...files]);
  };

  const handleRemoveMedia = (index) => {
    const file = media[index];
    if (file.isOld && file.id) {
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
      media.filter((m) => !m.isOld && m.file).forEach((m) => formData.append("files", m.file));
      const res = await api.put(`/v1/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200) {
        toast.success("Cập nhật bài viết thành công!");
        const existingFiles = media.filter((m) => m.isOld && !removedFileIds.includes(m.id)).map((m) => m.preview);
        const newFiles = media.filter((m) => !m.isOld).map((m) => m.preview);
        onPostUpdated?.({ ...post, content: newContent, privacy: newPrivacy, files: [...existingFiles, ...newFiles] });
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
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="relative p-4">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-semibold">Chỉnh sửa bài viết</h2>
            <button onClick={onClose} className="text-xl text-gray-400 hover:text-[var(--foreground)]">
              ✕
            </button>
          </div>

          {media.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange({ target: { files: e.dataTransfer.files } });
              }}
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
                onChange={handleFileChange}
                hidden
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 p-4">
              {/* Media bên trái */}
              <div className="md:w-1/2 w-full">
                <ImagePreview
                  images={media}
                  onImageClick={(i) => setZoomIndex(i)}
                  onDelete={handleRemoveMedia}
                  onAdd={() => fileInputRef.current.click()}
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  hidden
                />
              </div>

              {/* Nội dung & privacy bên phải */}
              <div className="md:w-1/2 w-full flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Privacy</label>
                  <select
                    value={newPrivacy}
                    onChange={(e) => setNewPrivacy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)]"
                  >
                    <option value="PUBLIC">🌍 Public</option>
                    <option value="FRIEND">👥 Friends</option>
                    <option value="PRIVATE">🔒 Only me</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    placeholder="Viết điều gì đó..."
                    className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)] resize-none"
                  />
                </div>

                <div className="flex justify-end mt-auto">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang lưu..." : "💾 Lưu"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 🔍 Modal zoom preview */}
      {zoomIndex !== null && (
        <Modal isOpen={zoomIndex !== null} onClose={() => setZoomIndex(null)}>
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-black">
            {media[zoomIndex]?.type === "video" ? (
              <video src={media[zoomIndex].preview} className="max-h-full max-w-full" controls autoPlay />
            ) : (
              <img
                src={media[zoomIndex].preview}
                className="max-h-full max-w-full object-contain"
                alt={`Preview ${zoomIndex}`}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

// Dummy helper
function extractFileIdFromUrl(url) {
  return url.split("/").pop()?.split(".")[0] || null;
}
