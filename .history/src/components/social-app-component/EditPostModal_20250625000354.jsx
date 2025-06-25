import { useState, useEffect } from "react"
import Modal from "../ui-components/Modal"
import ImagePreview from "../ui-components/ImagePreview"
import toast from "react-hot-toast"
import api from "@/utils/axios"

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const [newContent, setNewContent] = useState(post?.content || "")
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC")
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [previewImageIndex, setPreviewImageIndex] = useState(null)

  const isSharedPost = post?.sharedPost

  // Initialize images from existing files
  useEffect(() => {
    if (post?.files && Array.isArray(post.files) && !isSharedPost) {
      const existingImages = post.files.map((file, index) => ({
        id: file.id || index,
        preview: file.url || file.preview,
        type: file.type || (file.url?.includes('.mp4') ? 'video' : 'image'),
        file: null, // Existing files don't have file object
        isExisting: true
      }))
      setImages(existingImages)
    }
  }, [post, isSharedPost])

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
        const currentImages = images.filter(img => img.isExisting)
        const newFiles = images.filter(img => !img.isExisting && img.file)
        
        // Check if files were removed
        const removedFiles = existingFiles.filter(
          existingFile => !currentImages.some(img => img.id === existingFile.id)
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
          newFiles.forEach(img => {
            formData.append('files', img.file)
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
            ...images.filter(img => img.isExisting).map(img => ({
              id: img.id,
              url: img.preview,
              type: img.type
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
      const existingImages = post.files.map((file, index) => ({
        id: file.id || index,
        preview: file.url || file.preview,
        type: file.type || (file.url?.includes('.mp4') ? 'video' : 'image'),
        file: null,
        isExisting: true
      }))
      setImages(existingImages)
    }
    onClose()
  }

  const handleAddImages = (files) => {
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file: file,
      isExisting: false
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const handleDeleteImage = (index) => {
    const imageToDelete = images[index]
    if (imageToDelete && !imageToDelete.isExisting && imageToDelete.preview) {
      URL.revokeObjectURL(imageToDelete.preview)
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleImageClick = (index) => {
    setPreviewImageIndex(index)
  }

  return (
    <Modal isOpen={isOpen} size="large" onClose={handleClose}>
      <div className="p-6 w-full max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
          {isSharedPost ? "Chỉnh sửa chia sẻ" : "Chỉnh sửa bài viết"}
        </h2>
        
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

          {/* File editing for non-shared posts */}
          {!isSharedPost && (
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                Hình ảnh và video
              </label>
              <ImagePreview
                images={images}
                onImageClick={handleImageClick}
                onDelete={handleDeleteImage}
                onAdd={handleAddImages}
              />
            </div>
          )}
          
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
              {images[previewImageIndex]?.type === 'video' ? (
                <video
                  src={images[previewImageIndex].preview}
                  controls
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                />
              ) : (
                <img
                  src={images[previewImageIndex]?.preview}
                  alt={`Preview ${previewImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              <button
                onClick={() => setPreviewImageIndex(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  )
}