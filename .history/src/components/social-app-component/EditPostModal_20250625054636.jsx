"use client";

import { useState, useRef, useEffect } from "react";
import Modal from "../ui-components/Modal";
import ImagePreview from "../ui-components/ImagePreview";
import toast from "react-hot-toast";
import api from "@/utils/axios";

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const fileInputRef = useRef(null);

  const [newContent, setNewContent] = useState("");
  const [newPrivacy, setNewPrivacy] = useState("PUBLIC");
  const [media, setMedia] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(null);

  // Reset state khi modal mở/đóng hoặc post thay đổi
  useEffect(() => {
    if (isOpen && post) {
      setNewContent(post.content || "");
      setNewPrivacy(post.privacy || "PUBLIC");
      setRemovedFileIds([]);
      
      // Reset media từ post hiện tại
      const oldFiles = (post.files || []).map((url, index) => ({
        preview: url,
        type: url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? "video" : "image",
        isOld: true,
        id: extractFileIdFromUrl(url) || `old_${index}`, // fallback id nếu không extract được
      }));
      setMedia(oldFiles);
    } else if (!isOpen) {
      // Reset khi đóng modal
      setMedia([]);
      setZoomIndex(null);
      setRemovedFileIds([]);
    }
  }, [isOpen, post]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      isOld: false,
    }));
    setMedia((prev) => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      isOld: false,
    }));
    setMedia((prev) => [...prev, ...files]);
  };

  const handleAddFiles = () => {
    fileInputRef.current?.click();
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
      
      // Thêm các file đã xóa
      removedFileIds.forEach((id) => formData.append("removedIds", id));
      
      // Thêm các file mới
      media.filter((m) => !m.isOld && m.file).forEach((m) => formData.append("files", m.file));
      
      const res = await api.put(`/v1/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200) {
        toast.success("Cập nhật bài viết thành công!");
        
        // Cập nhật post với data mới
        const existingFiles = media.filter((m) => m.isOld && !removedFileIds.includes(m.id)).map((m) => m.preview);
        const newFiles = res.data.body?.files || []; // Lấy file URLs từ response
        
        onPostUpdated?.({ 
          ...post, 
          content: newContent, 
          privacy: newPrivacy, 
          files: [...existingFiles, ...newFiles] 
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

  // Kiểm tra xem có phải shared post không
  const isSharedPost = post?.sharedPost;
  
  // Kiểm tra quyền chỉnh sửa (có thể thêm logic kiểm tra user ownership)
  const canEditFiles = !isSharedPost; // Chỉ cho phép edit files nếu không phải shared post

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="relative">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-semibold">
              {isSharedPost ? "Chỉnh sửa bài chia sẻ" : "Chỉnh sửa bài viết"}
            </h2>
            <button onClick={onClose} className="text-xl text-gray-400 hover:text-[var(--foreground)]">
              ✕
            </button>
          </div>

          {/* Layout giống NewPostModal */}
          {canEditFiles && media.length === 0 ? (
            <div
              onClick={handleAddFiles}
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
                onChange={handleFileChange}
                hidden
              />
            </div>
          ) : (
            <div className={`flex flex-col ${canEditFiles && media.length > 0 ? 'md:flex-row' : ''} gap-6 p-4`}>
              {/* Media preview - chỉ hiển thị nếu được phép edit files */}
              {canEditFiles && media.length > 0 && (
                <div className="md:w-1/2 w-full">
                  <ImagePreview
                    images={media}
                    onImageClick={(i) => setZoomIndex(i)}
                    onDelete={handleRemoveMedia}
                    onAdd={handleAddFiles}
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
              )}

              {/* Form inputs */}
              <div className={`${canEditFiles && media.length > 0 ? 'md:w-1/2' : ''} w-full flex flex-col gap-4`}>
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
                  <label className="block text-sm font-medium mb-1">
                    {isSharedPost ? "Nội dung chia sẻ" : "Content"}
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    placeholder={isSharedPost ? "Bạn muốn nói gì về bài viết này?" : "Viết điều gì đó..."}
                    className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)] resize-none"
                  />
                </div>

                Hiển thị thông tin bài gốc nếu là shared post
                {isSharedPost && post.originalPost && (
                  <div className="p-3 border rounded-md bg-[var(--muted)]/20">
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Bài viết gốc:</p>
                    <p className="text-sm font-medium">
                      {post.originalPost.author?.familyName} {post.originalPost.author?.givenName}
                    </p>
                    {post.originalPost.content && (
                      <p className="text-sm mt-1">{post.originalPost.content}</p>
                    )}
                  </div>
                )}

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

          {/* Form cho trường hợp không có media (giống NewPostModal) */}
          {canEditFiles && media.length === 0 && (
            <div className="mt-4 space-y-4">
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
                <label className="block text-sm font-medium mb-1">What's on your mind?</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Viết điều gì đó..."
                  className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)] resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang lưu..." : "💾 Lưu"}
                </button>
              </div>
            </div>
          )}

          {/* Form cho shared post không được phép edit files */}
          {!canEditFiles && (
            <div className="mt-4 space-y-4">
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
                <label className="block text-sm font-medium mb-1">
                  Nội dung chia sẻ
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Bạn muốn nói gì về bài viết này?"
                  className="w-full px-3 py-2 border rounded-md bg-[var(--input)] text-[var(--foreground)] resize-none"
                />
              </div>

              {/* Hiển thị thông tin bài gốc */}
              {post?.originalPost && (
                <div className="p-3 border rounded-md bg-[var(--muted)]/20">
                  <p className="text-sm text-[var(--muted-foreground)] mb-1">Bài viết gốc:</p>
                  <p className="text-sm font-medium">
                    {post.originalPost.author?.familyName} {post.originalPost.author?.givenName}
                  </p>
                  {post.originalPost.content && (
                    <p className="text-sm mt-1">{post.originalPost.content}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang lưu..." : "💾 Lưu"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal zoom preview */}
      {zoomIndex !== null && canEditFiles && (
        <Modal isOpen={zoomIndex !== null} onClose={() => setZoomIndex(null)}>
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-black">
            {media[zoomIndex]?.type === "video" ? (
              <video 
                src={media[zoomIndex].preview} 
                className="max-h-full max-w-full" 
                controls 
                autoPlay 
              />
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

// Helper function để extract file ID từ URL
function extractFileIdFromUrl(url) {
  if (!url) return null;
  
  // Thử extract từ URL pattern thông thường
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  
  if (filename) {
    // Bỏ extension
    return filename.split(".")[0];
  }
  
  return null;
}