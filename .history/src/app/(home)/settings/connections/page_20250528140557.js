"use client";

import UserHeader from "@/components/UserHeader";

const connections = [
  {
    id: 1,
    name: "Nguyễn Thị Mai",
    avatar: "/avatars/user5.png",
    lastOnline: "Đang hoạt động",
  },
  {
    id: 2,
    name: "Hoàng Quốc Bảo",
    avatar: "/avatars/user6.png",
    lastOnline: "10 phút trước",
  },
  {
    id: 3,
    name: "Đặng Thùy Linh",
    avatar: "/avatars/user7.png",
    lastOnline: "3 giờ trước",
  },
  {
    id: 4,
    name: "Trần Anh Tú",
    avatar: "/avatars/user8.png",
    lastOnline: "1 ngày trước",
  },
];

export default function ConnectionsPage() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Kết nối</h1>

        <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
          {connections.map((user) => (
            <UserHeader
              key={user.id}
              user={user}
              variant="post"
              lastonline={true}
              isme={false}
              size="default"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
