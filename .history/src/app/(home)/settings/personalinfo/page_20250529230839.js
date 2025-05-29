"use client";

import React, { useState } from "react";
import Input from "@/components/ui-components/Input";

export default function PersonalInfoPage() {
  const [formData, setFormData] = useState({
    username: "hoanghuy.likau",
    familyName: "Huỳnh",
    givenName: "Hoàng Hoàng",
    birthdate: "2001-01-01",
    bio: "plè plè",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex-1 w-full p-8 space-y-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>

        <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Image
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

          {/* Họ và Tên */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Họ"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
              field
            />
            <Input
              label="Tên"
              name="givenName"
              value={formData.givenName}
              onChange={handleChange}
              field
            />
          </div>

          {/* Tên người dùng */}
          <Input
            label="Tên người dùng"
            name="username"
            value={formData.username}
            onChange={handleChange}
            field
          />

          {/* Ngày sinh */}
          <Input
            label="Ngày sinh"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            type="date"
            field
          />

          {/* Tiểu sử */}
          <div>
            <Input
              label="Tiểu sử"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={150}
              field
            />
            <div className="text-xs text-[var(--muted-foreground)] mt-1 text-right">
              {formData.bio.length} / 150
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
