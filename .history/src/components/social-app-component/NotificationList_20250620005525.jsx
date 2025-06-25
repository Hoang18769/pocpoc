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

  const fetchComments = async (postId) => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await api.get(`/v1/comments/of-post/${postId}`, {
        params: { page: 0, size: 50 }
      });
      console.log('Comments response:', res);
      setComments(res.data.body || []);
    } catch (err) {
      toast.error("Không thể tải bình luận");
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('Notification clicked:', notification);
    
    // Mark as read when clicked
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.targetType === 'USER' || notification.targetType="" && notification.targetId) {
      // Navigate to user profile
      router.push(`/profile/${notification.targetId}`);
    } else if (notification.targetType === 'POST' && notification.targetId) {
      console.log('Fetching post with ID:', notification.targetId);
      setIsLoadingPost(true);
      
      try {
        const response = await api.get(`/v1/posts/${notification.targetId}`);
        console.log('Post fetch response:', response);
        console.log('Response data:', response.data);
        console.log('Response body:', response.data.body);
        
        if (response.data.body) {
          setSelectedPost(response.data.body);
          setIsPostModalOpen(true);
          // Fetch comments for the post
          fetchComments(notification.targetId);
        } else {
          console.error('No post data in response body');
          toast.error('Không thể tải bài viết - dữ liệu trống');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        console.error('Error response:', error.response);
        toast.error('Không thể tải bài viết');
      } finally {
        setIsLoadingPost(false);
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
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Thông báo
            </h2>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                Đang tải...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Không thể tải thông báo.
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                Không có thông báo nào.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n, idx) => (
                  <div
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-[var(--foreground)] font-medium">
                            {formatNotificationText(n)}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {new Date(n.sentAt).toLocaleString()}
                        </p>
                      </div>

                      {!n.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1">
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Modal with high z-index to appear above other elements */}
      {isPostModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50">
          <PostModal
            post={selectedPost}
            comments={comments}
            isLoadingComments={loadingComments}
            onRefreshComments={() => fetchComments(selectedPost.id)}
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