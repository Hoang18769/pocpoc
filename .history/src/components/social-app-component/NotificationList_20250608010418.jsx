import { useMinLoading } from "@/hooks/useMinLoading"
import { fetchNotifications } from "@/hooks/fetchNotification"

export default function NotificationList() {
  const { loading, data: notifications = [], error } = useMinLoading(
    () => {
      const token = localStorage.getItem("accessToken")
      return fetchNotifications(token)
    },
    [], // 👈 deps là array literal hợp lệ
    1000
  )

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
                {n.creator?.givenName} • {n.action}
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
  )
}
