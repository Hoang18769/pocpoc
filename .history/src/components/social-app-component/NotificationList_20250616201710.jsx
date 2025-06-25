import { useMinLoading } from "@/hooks/useMinLoading";
import { fetchNotifications } from "@/hooks/fetchNotification";

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
  const { loading, data: notifications = [], error } = useMinLoading(
    () => {
      const token = localStorage.getItem("accessToken");
      return fetchNotifications(token);
    },
    [],
    1000
  );

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
              key={idx}
              className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm"
            >
              <p className="text-sm text-[var(--foreground)] font-medium">
                {formatNotificationText(n)}
              </p>
              <time
                className="block text-xs text-[var(--muted-foreground)] mt-1"
                dateTime={n.sentAt}
              >
                {new Date(n.sentAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
