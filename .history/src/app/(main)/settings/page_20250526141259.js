import React from "react";
import { Home, Bell, Lock, Star, Ban, VideoOff, MessageCircle, AtSign, MessageSquare, Share2, UserX } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Chỉnh sửa trang cá nhân" },
  { icon: Bell, label: "Thông báo" },
  { icon: Lock, label: "Quyền riêng tư của tài khoản" },
  { icon: Star, label: "Bạn thân" },
  { icon: Ban, label: "Đã chặn" },
  { icon: VideoOff, label: "Ẩn tin và video trực tiếp" },
  { icon: MessageCircle, label: "Tin nhắn và lượt phản hồi tin" },
  { icon: AtSign, label: "Thẻ và lượt nhắc" },
  { icon: MessageSquare, label: "Bình luận" },
  { icon: Share2, label: "Chia sẻ và tái sử dụng" },
  { icon: UserX, label: "Tài khoản bị hạn chế" }
];

export default function SettingsOverview() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-[var(--border)] p-6 space-y-6">
        <h2 className="text-sm text-[var(--muted-foreground)] font-semibold"></h2>
        <nav className="space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className="w-full flex items-center gap-3 text-left px-4 py-2 rounded-md hover:bg-[var(--muted)] transition-colors"
            >
              <item.icon className="w-5 h-5 text-[var(--foreground)]" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Chỉnh sửa trang cá nhân</h1>

        <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-6">
          <div className="flex items-center gap-6">
            <img
              src="https://via.placeholder.com/80"
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-lg">hoanghuy.likau</div>
              <div className="text-[var(--muted-foreground)]">Huỳnh Hoàng Hoàng</div>
            </div>
            <button className="ml-auto bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] px-4 py-2 rounded-md">
              Đổi ảnh
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Trang web</label>
            <input
              type="text"
              value="open.spotify.com/playlist/..."
              disabled
              className="w-full bg-[var(--input)] text-[var(--muted-foreground)] px-3 py-2 rounded-md"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Bạn chỉ có thể chỉnh sửa liên kết trên di động.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Tiểu sử</label>
            <input
              type="text"
              maxLength={150}
              value="plè plè"
              className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md"
            />
            <div className="text-xs text-[var(--muted-foreground)] mt-1 text-right">7 / 150</div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Hiển thị huy hiệu Threads</label>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
        </div>
      </main>
    </div>
  );
}
