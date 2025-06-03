"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MotionContainer from "@/components/ui-components/MotionContainer";
import {
  UserCircle, Lock, ShieldCheck, Users, Ban, Flag,
  FileText, Database, MessageCircle, MessageSquare, Mail,
} from "lucide-react";

const groupedMenuItems = [
  {
    title: "Tài khoản",
    items: [
      { id: "personalinfo", icon: UserCircle, label: "Thông tin cá nhân" },
      { id: "privacy", icon: Lock, label: "Bảo mật & Quyền riêng tư" },
      { id: "restrictedaccounts", icon: ShieldCheck, label: "Tài khoản bị hạn chế" },
    ]
  },
  {
    title: "Tương tác",
    items: [
      // { id: "connections", icon: Users, label: "Bạn bè & Kết nối" },
      { id: "blockedlist", icon: Ban, label: "Danh sách chặn" },
      { id: "sentreports", icon: Flag, label: "Báo cáo đã gửi" },
    ]
  },
  {
    title: "Nội dung",
    items: [
      { id: "savedposts", icon: FileText, label: "Bài viết & Bình luận đã lưu" },
      { id: "uploadedFiles", icon: Database, label: "Tệp đã tải lên" },
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

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-[var(--border)] p-6 overflow-y-auto">
        <h2 className="text-sm text-[var(--muted-foreground)] font-semibold mb-6">Cài đặt người dùng</h2>
        <nav className="space-y-6">
          {groupedMenuItems.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-2">
                {group.title}
              </h3>
              {group.items.map((item, subIdx) => (
                <Link
                  key={subIdx}
                  href={`/settings/${item.id}`}
                  className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-md hover:bg-[var(--muted)] transition-colors ${
                    pathname.endsWith(item.id) ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5 text-[var(--foreground)]" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content with animation */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <MotionContainer modeKey={pathname} effect="fadeUp" duration={0.25}>
          {children}
        </MotionContainer>
      </main>
    </div>
  );
}
