"use client";

import { useEffect, useState } from "react";
import UserHeader from "@/components/social-app-component/UserHeader";
import api from "@/utils/axios";
import toast from "react-hot-toast";

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const res = await api.get("/v1/blocks");
        if (res.data.code === 200) {
          setBlockedUsers(res.data.body.map((item) => item.user));
        } else {
          toast.error("Không thể tải danh sách chặn");
        }
      } catch (err) {
        toast.error("Lỗi kết nối khi tải danh sách chặn");
        console.error("❌ Block fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Đã chặn</h1>

        <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
          {loading ? (
            <p>Đang tải...</p>
          ) : blockedUsers.length === 0 ? (
            <p>Bạn chưa chặn người dùng nào.</p>
          ) : (
            blockedUsers.map((user) => (
              <UserHeader
                key={user.id}
                user={{
                  name: `${user.familyName} ${user.givenName}`,
                  avatar: user.avatar || "/avatars/default.png",
                  lastOnline: user.online ? "Đang hoạt động" : "Ngoại tuyến",
                }}
                variant="post"
                lastonline={true}
                isme={false}
                size="default"
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
