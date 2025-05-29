import React from "react";
import Link from "next/link";
import {
  UserCircle,
  Bell,
  Lock,
  Users,
  Ban,
  MessageCircle,
  FileText,
  Flag,
  ShieldCheck,
  Mail,
  Database,
  MessageSquare,
} from "lucide-react";

const groupedMenuItems = [
  {
    title: "Tài khoản",
    items: [
      { id: "PersonalInfo", icon: UserCircle, label: "Thông tin cá nhân" },
      { id: "Privacy", icon: Lock, label: "Bảo mật & Quyền riêng tư" },
      { id: "RestrictedAccounts", icon: ShieldCheck, label: "Tài khoản bị hạn chế" },
    ]
  },
  {
    title: "Tương tác",
    items: [
      { id: "Connections", icon: Users, label: "Bạn bè & Kết nối" },
      { id: "BlockedList", icon: Ban, label: "Danh sách chặn" },
      { id: "SentReports", icon: Flag, label: "Báo cáo đã gửi" },
    ]
  },
  {
    title: "Nội dung",
    items: [
      { id: "SavedPosts", icon: FileText, label: "Bài viết & Bình luận đã lưu" },
      { id: "UploadedFiles", icon: Database, label: "Tệp đã tải lên" },
    ]
  },
  {
    title: "Tin nhắn & Thông báo",
    items: [
      { id: "Messages", icon: MessageCircle, label: "Tin nhắn" },
      { id: "GroupChatActivity", icon: MessageSquare, label: "Hoạt động Chat nhóm" },
      { id: "Notifications", icon: Mail, label: "Thông báo hệ thống" },
    ]
  }
];

export default function SettingsOverview() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
     
      {/* Main content */}
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>

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
