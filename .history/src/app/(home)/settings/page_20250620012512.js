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
  
  
];

export default function SettingsOverview() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
     
      {/* Main content */}
      
    </div>
  );
}
