import { useEffect } from 'react';
import useAppStore from '@/store/useAppStore';

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

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    // You can add navigation logic here based on notification.action
  };

  return (
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
  );
}