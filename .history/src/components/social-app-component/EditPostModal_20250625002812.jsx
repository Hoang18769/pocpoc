import { useState } from "react"
import Modal
import toast from "react-hot-toast"
import api from "@/utils/axios"

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const [newContent, setNewContent] = useState(post?.content || "")
  const [newPrivacy, setNewPrivacy] = useState(post?.privacy || "PUBLIC")
  const [loading, setLoading] = useState(false)

  const handleSaveEdit = async () => {
    setLoading(true)
    try {
      const requests = []
      if (newContent !== post.content) {
        requests.push(
          api.patch(`/v1/posts/update-content/${post.id}`, null, {
            params: { content: newContent }
          })
        )
      }
      if (newPrivacy !== post.privacy) {
        requests.push(
          api.patch(`/v1/posts/update-privacy/${post.id}`, null, {
            params: { privacy: newPrivacy }
          })
        )
      }
      await Promise.all(requests)
      toast.success("Cập nhật bài viết thành công!")
      
      // Update the post object with new values
      if (onPostUpdated) {
        onPostUpdated({
          ...post,
          content: newContent,
          privacy: newPrivacy
        })
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
    onClose()
  }

  return (
    <Modal isOpen={isOpen} size="medium" onClose={handleClose}>
      <div className="p-6 w-full max-w-lg mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Chỉnh sửa bài viết</h2>
        
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
      </div>
    </Modal>
  )
}