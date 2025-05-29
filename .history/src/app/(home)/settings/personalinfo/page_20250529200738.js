"use client";
import React, { useState } from "react";

export default function PersonalInfoPage() {
  const [formData, setFormData] = useState({
    username: "hoanghuy.likau",
    familyName: "Huỳnh",
    givenName: "Hoàng Hoàng",
    birthdate: "2001-01-01",
    bio: "plè plè",
    showFriends: true,
    allowFriendRequest: true,
    defaultPostPrivacy: "friends",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>

        <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <img
              src="https://via.placeholder.com/80"
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-lg">{formData.username}</div>
              <div className="text-[var(--muted-foreground)]">
                {formData.familyName} {formData.givenName}
              </div>
            </div>
            <button className="ml-auto bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] px-4 py-2 rounded-md">
              Đổi ảnh
            </button>
          </div>

          {/* Tên */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Họ</label>
              <input
                type="text"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tên</label>
              <input
                type="text"
                name="givenName"
                value={formData.givenName}
                onChange={handleChange}
                className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* Tên người dùng */}
          <div>
            <label className="block text-sm font-semibold mb-1">Tên người dùng</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md"
            />
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-semibold mb-1">Ngày sinh</label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md"
            />
          </div>

          {/* Tiểu sử */}
          <div>
            <label className="block text-sm font-semibold mb-1">Tiểu sử</label>
            <input
              type="text"
              name="bio"
              maxLength={150}
              value={formData.bio}
              onChange={handleChange}
              className="w-full bg-[var(--input)] text-[var(--foreground)] px-3 py-2 rounded-md"
            />
            <div className="text-xs text-[var(--muted-foreground)] mt-1 text-right">
              {formData.bio.length} / 150
            </div>
          </div>

          {/* Hiển thị danh sách bạn */}
         
        </div>
      </main>
    </div>
  );
}
