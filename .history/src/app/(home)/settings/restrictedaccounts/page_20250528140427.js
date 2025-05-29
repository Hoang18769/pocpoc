"use client";
import React from "react";
import Link from "next/link";
const blockedUsers = [
  {
    id: 1,
    name: "Trần Minh Khôi",
    avatar: "/avatars/user1.png",
    lastOnline: "5 phút trước",
  },
  {
    id: 2,
    name: "Lê Hồng Nhung",
    avatar: "/avatars/user2.png",
    lastOnline: "2 giờ trước",
  },
  {
    id: 3,
    name: "Nguyễn Văn A",
    avatar: "/avatars/user3.png",
    lastOnline: "1 ngày trước",
  },
  {
    id: 4,
    name: "Phạm Thị B",
    avatar: "/avatars/user4.png",
    lastOnline: "Đang hoạt động",
  },
];

export default function RestrictedAccounts() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Tài khoản bị hạn chế</h1>

        <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-6">
          {/* Danh sách người dùng đã chặn */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              Danh sách người dùng bạn đã chặn
            </span>
            
            <Link
              href="/settings/blockedList"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Xem danh sách
            </Link>
          </div>

          {/* Báo cáo đã gửi */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Báo cáo đã gửi</span>
            <Link
              href="/settings/sentreports"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Xem chi tiết
            </Link>
          </div>

          {/* Hạn chế nhận lời mời kết bạn */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Ai có thể gửi lời mời kết bạn cho bạn?
            </label>
            <select className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md">
              <option>Ai cũng được</option>
              <option>Bạn của bạn bè</option>
              <option>Không ai</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  );
}
