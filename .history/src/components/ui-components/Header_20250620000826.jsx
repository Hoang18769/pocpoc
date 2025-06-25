"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Search, Plus, MessageCircle, LogOut } from "lucide-react";
import Badge from "@/components/ui-components/Badge";
import ThemeToggle from "./Themetoggle";
import { useRouter } from "next/navigation";
import axios from "axios";
import api, { clearSession } from "@/utils/axios";
import NewPostModal from "../social-app-component/CreatePostForm";
import NotificationList from "../social-app-component/NotificationList";
import useAppStore from "@/store/ZustandStore";

export default function Header({ className = "" }) {
  const router = useRouter();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const clearAllData = useAppStore(state => state.clearAllData);

  // Đóng notification khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = async () => {
  try {
    await api.delete("/v1/auth/logout");
  } catch (err) {
    console.error("Logout failed:", err.response?.data || err.message);
  } finally {
    clearSession(); // ✅ xoá localStorage + cookie + token headers
    clearAllData();

    router.push("/register");
  }
};


  return (
    <>
      <header
        className="w-full px-6 flex items-center justify-between bg-[var(--background)]"
        style={{ height: "64px", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
      >
        <div className="w-1/3"></div>

        {/* Center - Logo */}
        <div className="sm:block w-1/3 flex justify-center">
          <Link href="/home" className="font-bold text-2xl text-[var(--foreground)]">
            pocpoc
          </Link>
        </div>

        <div className="flex justify-end space-x-2 items-center relative">
          

          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="w-12 h-12 bg-[var(--card)] rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition relative"
          >
            <Bell size={20} className="text-[var(--foreground)]" />
            <Badge asNotification>{7}</Badge>
          </button>

          {showNotifications && (
  <div
    ref={notificationRef}
    className="absolute top-16 right-4 z-50 w-80 max-h-[400px] overflow-y-auto rounded-xl shadow-lg bg-[var(--card)] border border-[var(--border)]"
  >
    <NotificationList />
  </div>
)}
          

          <div
            role="group"
            aria-label="Add and Messages"
            className="h-12 bg-[var(--card)] rounded-full flex items-center"
          >
            <button
              type="button"
              aria-label="Add"
              onClick={() => setShowPostModal(true)}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition rounded-l-full"
            >
              <Plus size={20} className="text-[var(--foreground)]" />
            </button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

            <button
              type="button"
              aria-label="Messages"
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition rounded-r-full"
            >
              <MessageCircle size={20} className="text-[var(--foreground)]" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Logout"
            onClick={handleLogout}
            className="w-12 h-12 bg-[var(--card)] rounded-full flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-700 transition"
          >
            <LogOut size={20} className="text-red-500" />
          </button>
        </div>
      </header>

      {/* 📌 Modal tạo bài viết */}
      {showPostModal && (
        <NewPostModal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
        />
      )}
    </>
  );
}
