"use client"

import React, { useState } from "react"
import api from "@/utils/axios"
import PostCard from "@/components/social-app-component/PostCard"
import Avatar from "@/components/ui-components/Avatar"
import Input from "@/components/ui-components/Input"

export default function ExplorerPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState({ USER: [], POST: [] })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    try {
      setLoading(true)
      const res = await api.get("/v1/search", {
        params: {
          query: trimmed,
          type: "NOT_SET",
          page: 0,
          size: 10,
        },
      })
      setResults(res.data.body)
    } catch (err) {
      console.error("Lỗi khi tìm kiếm", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 py-6">
      {/* Cột trái: tìm kiếm và kết quả */}
      <div className="flex-1 space-y-6">
        <h1 className="text-xl font-bold">Khám phá</h1>

        {/* Form tìm kiếm */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm người dùng hoặc bài viết..."
            className="flex-1"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tìm
          </button>
        </form>

        {/* Loading */}
        {loading && <p className="text-sm text-gray-500">Đang tìm kiếm...</p>}

        {/* Kết quả */}
        {!loading && results.USER.length === 0 && results.POST.length === 0 && (
          <p className="text-gray-500">Không có kết quả.</p>
        )}

        {/* Người dùng */}
        {results.USER.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Người dùng</h2>
            <ul className="space-y-2">
              {results.USER.map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatar || ""}
                      alt={user.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">
                        {user.givenName} {user.familyName}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-500 hover:underline">Theo dõi</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bài viết */}
        {results.POST.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Bài viết</h2>
            {results.POST.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Cột phải: gợi ý */}
      <div className="w-full lg:w-[300px] shrink-0">
        <div className="sticky top-20 space-y-4">
          <h2 className="text-lg font-semibold">Gợi ý cho bạn</h2>
          <ul className="space-y-3">
            {results.USER.slice(0, 3).map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar || ""}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{user.username}</span>
                </div>
                <button className="text-sm text-blue-500 hover:underline">Theo dõi</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
