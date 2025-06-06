"use client";

import { useEffect, useState } from "react";
import { fetchNotifications } from "@/hooks/fetchNotification";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetchNotifications(token)
      .then((data) => {
        setNotifications(data || []);
        console.log("🧠 Notifications:", data);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi fetch thông báo:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Thông báo</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : notifications.length === 0 ? (
        <p>Không có thông báo nào.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n, idx) => (
            <li key={idx} className="bg-gray-100 dark:bg-gray-800 p-3 rounded shadow">
              <p className="font-medium">
                {n.creator?.givenName} • {n.action}
              </p>
              <small className="text-sm text-gray-500">
                {new Date(n.sentAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
