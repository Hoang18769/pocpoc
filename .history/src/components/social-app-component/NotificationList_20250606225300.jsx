"use client"

import { useEffect, useState } from "react"
import { fetchNotifications } from "@/hooks/fetchNotification"

export default function NotificationList() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    fetchNotifications(token)
      .then((data) => setNotifications(data || []))
      .catch((err) => {
        console.error("❌ Lỗi khi fetch thông báo:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Thông báo</h2>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Đang tải...</p>
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
