import { useState, useEffect, useRef } from "react"
import Modal from "../ui-components/Modal"
import ImagePreview from "../ui-components/ImagePreview"
import toast from "react-hot-toast"
import api from "@/utils/axios"

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const fileInputRef = useRef(null)
  const [newContent, setNewContent] = useState(post?.content || "")
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC")
  const [loading, setLoading] = useState(false)
  const [media, setMedia] = useState([])
  const [previewImageIndex, setPreviewImageIndex] = useState(null)

  const isSharedPost = post?.sharedPost

  // Initialize media from existing files
  useEffect(() => {
    if (post?.files && Array.isArray(post.files) && !isSharedPost) {
      const existingMedia = post.files.map((file, index) => ({
        id: file.id || index,
        preview: file.url || file.preview,
        type: file.type || (file.url?.includes('.mp4') ? 'video' : 'image'),
        file: null, // Existing files don't have file object
        isExisting: true
      }))
      setMedia(existingMedia)
    }
  }, [post, isSharedPost])

  const handleMediaSelect = (files) => {
    const mediaFiles = files.filter((file) =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    const newMedia = mediaFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      isExisting: false
    }));

    setMedia((prev) => [...prev, ...newMedia]);
  };

  const handleFileChange = (e) => {
    handleMediaSelect(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleMediaSelect(Array.from(e.dataTransfer.files));
  };

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (index) => {
    const mediaToDelete = media[index]
    if (mediaToDelete && !mediaToDelete.isExisting && mediaToDelete.preview) {
      URL.revokeObjectURL(mediaToDelete.preview)
    }
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    setLoading(true)
    try {
      const requests = []
      
      // Update content if changed
      if (newContent !== post.content) {
        requests.push(
          api.patch(`/v1/posts/update-content/${post.id}`, null, {
            params: { content: newContent }
          })
        )
      }
      
      // Update privacy if changed
      if (newPrivacy !== post.privacy) {
        requests.push(
          api.patch(`/v1/posts/update-privacy/${post.id}`, null, {
            params: { privacy: newPrivacy }
          })
        )
      }

      // Handle file updates for non-shared posts
      if (!isSharedPost) {
        const existingFiles = post.files || []
        const currentMedia = media.filter(item => item.isExisting)
        const newFiles = media.filter(item => !item.isExisting && item.file)
        
        // Check if files were removed
        const removedFiles = existingFiles.filter(
          existingFile => !currentMedia.some(item => item.id === existingFile.id)
        )
        
        // Delete removed files
        if (removedFiles.length > 0) {
          const deletePromises = removedFiles.map(file => 
            api.delete(`/v1/posts/files/${post.id}/${file.id}`)
          )
          requests.push(...deletePromises)
        }
        
        // Upload new files
        if (newFiles.length > 0) {
          const formData = new FormData()
          newFiles.forEach(item => {
            formData.append('files', item.file)
          })
          
          requests.push(
            api.post(`/v1/posts/files/${post.id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
          )
        }
      }

      await Promise.all(requests)
      toast.success("Cập nhật bài viết thành công!")
      
      // Update the post object with new values
      if (onPostUpdated) {
        const updatedPost = {
          ...post,
          content: newContent,
          privacy: newPrivacy
        }
        
        // Update files for non-shared posts
        if (!isSharedPost) {
          const updatedFiles = [
            ...media.filter(item => item.isExisting).map(item => ({
              id: item.id,
              url: item.preview,
              type: item.type
            })),
            // New files will be handled by the server response
          ]
          updatedPost.files = updatedFiles
        }
        
        onPostUpdated(updatedPost)
      }
      
      onClose()
    } catch (err) {
      toast.error("Lỗi khi cập nhật bài viết!")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setNewContent(post?.content || "")
    setNewPrivacy(post?.privacy || "PUBLIC")
    if (!isSharedPost && post?.files) {
      const existingMedia = post.files.map((file, index) => ({
        id: file.id || index,
        preview: file.url || file.preview,
        type: file.type || (file.url?.includes('.mp4') ? 'video' : 'image'),
        file: null,
        isExisting: true
      }))
      setMedia(existingMedia)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} size="large" onClose={handleClose}>
      <div className="p-6 w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {isSharedPost ? "Chỉnh sửa chia sẻ" : "Chỉnh sửa bài viết"}
          </h2>
          <button
            onClick={handleClose}
            className="text-xl text-gray-400 hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Layout similar to NewPostModal */}
        {!isSharedPost && media.length === 0 ? (
          <div>
            {/* Upload area when no media */}
            <div
              onClick={handleClickUploadArea}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg p-10 text-gray-500 hover:border-[var(--primary)] cursor-pointer transition-colors space-y-2 mb-4"
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

            {/* Content and privacy form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                  Quyền riêng tư
                </label>
                <select
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--input)] text-[var(--foreground)]"
                  value={newPrivacy}
                  onChange={(e) => setNewPrivacy(e.target.value)}
                >
                  <option value="PUBLIC">🌍 Công khai</option>
                  <option value="FRIEND">👥 Bạn bè</option>
                  <option value="PRIVATE">🔒 Chỉ mình tôi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                  Nội dung bài viết
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm text-[var(--foreground)] bg-[var(--input)] resize-none"
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Viết điều gì đó..."
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
          </div>
        ) : !isSharedPost && media.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 w-full">
              <ImagePreview
                images={media}
                onImageClick={(i) => setPreviewImageIndex(i)}
                onDelete={handleRemoveMedia}
                onAdd={handleClickUploadArea}
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

            <div className="md:w-1/2 w-full flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                  Quyền riêng tư
                </label>
                <select
                  value={newPrivacy}
                  onChange={(e) => setNewPrivacy(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--foreground)]"
                >
                  <option value="PUBLIC">🌍 Công khai</option>
                  <option value="FRIEND">👥 Bạn bè</option>
                  <option value="PRIVATE">🔒 Chỉ mình tôi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                  Nội dung bài viết
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Viết điều gì đó..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--foreground)] resize-none"
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
        ) : (
          // Layout for shared posts (no media editing)
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                Nội dung bài viết
              </label>
              <textarea
                className="w-full p-3 border border-[var(--border)] rounded-md text-sm text-[var(--foreground)] bg-[var(--background)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Nhập nội dung bài viết..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                Quyền riêng tư
              </label>
              <select
                className="w-full p-3 border border-[var(--border)] rounded-md text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newPrivacy}
                onChange={(e) => setNewPrivacy(e.target.value)}
              >
                <option value="PUBLIC">🌍 Công khai</option>
                <option value="FRIEND">👥 Bạn bè</option>
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              </select>
            </div>
            
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded-md border border-[var(--border)] text-sm font-medium hover:bg-[var(--input)] disabled:opacity-50 text-[var(--foreground)]"
              >
                ❌ Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : "💾 Lưu"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {previewImageIndex !== null && (
        <Modal 
          isOpen={true} 
          size="full" 
          onClose={() => setPreviewImageIndex(null)}
        >
          <div className="flex items-center justify-center h-full bg-black/90">
            <div className="relative max-w-full max-h-full">
              {media[previewImageIndex]?.type === 'video' ? (
                <video
                  src={media[previewImageIndex].preview}
                  controls
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                />
              ) : (
                <img
                  src={media[previewImageIndex]?.preview}
                  alt={`Preview ${previewImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              <button
                onClick={() => setPreviewImageIndex(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  )
}