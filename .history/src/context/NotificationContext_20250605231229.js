"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchNotifications } from "@/api/notification/fetchNotifications";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [token, setToken] = useState(null);

  // ✅ Lấy token từ localStorage
  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t) setToken(t);
  }, []);

  // ✅ Gọi API khi đã có token
  useEffect(() => {
    if (!token) return;
    fetchNotifications(token)
      .then((data) => {
        setNotifications(data.content || []);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi lấy notifications từ server:", err);
      });
  }, [token]);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
