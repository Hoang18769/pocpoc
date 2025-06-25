import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/ZustandStore';
import api from '@/utils/axios';
import PostModal from '@/components/social-app-component/PostModal';
import toast from 'react-hot-toast';

function formatNotificationText(n) {
  const name = n.creator?.givenName || "Người dùng";
  switch (n.action) {
    case "SENT_ADD_FRIEND_REQUEST":
      return `${name} đã gửi lời mời kết bạn 💌`;
    case "BE_FRIEND":
      return `${name} đã trở thành bạn bè 👥`;
    case "POST":
      return `${name} đã đăng một bài viết mới`;
    case "SHARE":
      return `${name} đã chia sẻ một bài viết mới`;
    case "LIKE_POST":
      return `${name} đã thích bài viết của bạn ❤️`;
    case "COMMENT":
      return `${name} đã bình luận về bài viết của bạn`;
    case "REPLY_COMMENT":
      return `${name} đã trả lời bình luận`;
    case "ACCEPTED_FRIEND_REQUEST":
      return `${name} đã chấp nhận lời mời kết bạn 🤝`;
    case "NEW_MESSAGE":
      return `${name} đã nhắn tin cho bạn 💬`;
    default:
      return `🔔 Có thông báo mới từ ${name}`;
  }
}

export default function NotificationList() {
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const { 
    notifications,
    isLoadingNotifications: loading,
    error,
    ensureNotificationsLoaded,
    markNotificationAsRead
  } = useAppStore();

  useEffect(() => {
    // Tự động fetch notifications nếu danh sách rỗng
    ensureNotificationsLoaded();
  }, [ensureNotificationsLoaded]);

  const fetchPostData = async (postId) => {
    setIsLoadingPost(true);
    try {
      const response = await api.get(`/v1/posts/${postId}`);
        return response.data.body;

    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Không thể tải bài viết');
      return null;
    } finally {

      setIsLoadingPost(false);
    }
  };

  const fetchComments = async (postId) => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await api.get(`/v1/comments/of-post/${postId}`, {
        params: { page: 0, size: 50 }
      });
      setComments(res.data.body || []);
    } catch (err) {
      toast.error("Không thể tải bình luận");
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.targetType === 'user' && notification.targetId) {
      // Navigate to user profile
      router.push(`/profile/${notification.${}}`);
    } else if (notification.targetType === 'post' && notification.targetId) {
      // Fetch post data and show in modal
      const postData = await fetchPostData(notification.targetId);
      if (postData) {
        setSelectedPost(postData);
        setIsPostModalOpen(true);
        // Fetch comments for the post
        fetchComments(notification.targetId);
      }
    }
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
    setComments([]);
  };

  return (
    <>
      <section className="p-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Thông báo</h2>

        {loading ? (
          <p className="text-sm text-[var(--muted-foreground)]">Đang tải...</p>
        ) : error ? (
          <p className="text-sm text-red-500">Không thể tải thông báo.</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Không có thông báo nào.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n, idx) => (
              <li
                key={n.id || idx}
                onClick={() => handleNotificationClick(n)}
                className={`
                  bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm
                  cursor-pointer hover:bg-[var(--accent)] transition-colors
                  ${!n.isRead ? 'ring-2 ring-blue-500/20 bg-blue-50/50' : ''}
                  ${isLoadingPost ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-[var(--foreground)] font-medium">
                      {formatNotificationText(n)}
                    </p>
                    <time
                      className="block text-xs text-[var(--muted-foreground)] mt-1"
                      dateTime={n.sentAt}
                    >
                      {new Date(n.sentAt).toLocaleString()}
                    </time>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Post Modal with high z-index to appear above other elements */}
      {isPostModalOpen && selectedPost && (
        <div className="fixed inset-0 z-[9999]">
          <PostModal
            post={selectedPost}
            liked={selectedPost.liked}
            likeCount={selectedPost.likeCount}
            activeIndex={null}
            comments={comments}
            loadingComments={loadingComments}
            onFetchComments={() => fetchComments(selectedPost.id)}
            onClose={closePostModal}
            onLikeToggle={() => {
              // Handle like toggle if needed
              console.log('Like toggled for post:', selectedPost.id);
            }}
          />
        </div>
      )}
    </>
  );
}