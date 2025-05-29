import React from "react";

export default function PrivacySettings() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Bảo mật & Quyền riêng tư</h1>

        <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-6">
          {/* Quyền hiển thị danh sách bạn bè */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Ai có thể xem danh sách bạn bè của bạn?
            </label>
            <select className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md">
              <option>Công khai</option>
              <option>Chỉ bạn bè</option>
              <option>Chỉ mình tôi</option>
            </select>
          </div>

          {/* Mặc định quyền riêng tư bài viết */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Quyền riêng tư mặc định cho bài viết mới
            </label>
            <select className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md">
              <option>Công khai</option>
              <option>Chỉ bạn bè</option>
              <option>Chỉ mình tôi</option>
            </select>
          </div>

          {/* Cho phép gửi lời mời kết bạn */}
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

          {/* Trạng thái xác minh email */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Email đã xác minh</span>
            <span className="text-sm text-green-600 font-medium">Đã xác minh</span>
          </div>

          {/* Khóa tạm thời tài khoản (chỉ hiển thị nếu bị khóa) */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Tài khoản tạm thời bị khóa</span>
            <span className="text-sm text-red-600 font-medium">Không</span>
          </div>

          {/* Danh sách chặn */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Xem danh sách người dùng đã chặn</span>
            <a
              href="/settings/BlockedList"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Xem danh sách
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}
