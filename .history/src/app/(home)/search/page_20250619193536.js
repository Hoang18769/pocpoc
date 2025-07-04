"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import PostCard from "@/components/social-app-component/PostCard";
import Avatar from "@/components/ui-components/Avatar";
import Input from "@/components/ui-components/Input";
import UserHeader from "@/components/social-app-component/UserHeader";
import { useRouter } from "next/navigation";

let debounceTimeout = null;

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ USER: [], POST: [] });
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const router = useRouter();

  useEffect(() => {
    // Lấy danh sách gợi ý bạn bè
    api
      .get("/v1/friends/suggested")
      .then((res) => setSuggestedUsers(res.data.body || []))
      .catch((err) => console.error("Lỗi lấy gợi ý bạn bè", err));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ USER: [], POST: [] });
      return;
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchSearch(query.trim());
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const fetchSearch = async (keyword) => {
    try {
      setLoading(true);
      const res = await api.get("/v1/search", {
        params: {
          query: keyword,
          type: "NOT_SET",
          page: 0,
          size: 10,
        },
      });
      setResults(res.data.body);
    } catch (err) {
      console.error("Lỗi tìm kiếm", err);
    } finally {
      setLoading(false);
    }
  };

  const goToProfile = (username) => {
    if (username) router.push(`/profile/${username}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 py-6">
      {/* Cột trái: tìm kiếm và kết quả */}
      <div className="flex-1 space-y-6">
        <h1 className="text-xl font-bold">Khám phá</h1>

        {/* Ô tìm kiếm */}
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm người dùng hoặc bài viết..."
            className="flex-1"
          />
        </div>

        {/* Loading */}
        {loading && <p className="text-sm text-gray-500">Đang tìm kiếm...</p>}

        {/* Không có kết quả */}
        {!loading && query && results.USER.length === 0 && results.POST.length === 0 && (
          <p className="text-gray-500">Không có kết quả.</p>
        )}

        {/* Người dùng */}
        {results.USER.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Người dùng</h2>
            <ul className="space-y-2">
              {results.USER.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                  onClick={() => goToProfile(user.username)}
                >
                  <UserHeader
                    user={{
                      familyName: user.familyName,
                      givenName: user.givenName,
                      profilePictureUrl: user.avatar,
                      lastOnline: user.isOnline ? "Online" : user.lastOnline,
                    }}
                    showOptions={false}
                    className="p-0"
                  />
                  <button
                    className="text-sm text-blue-500 hover:underline whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: handle theo dõi
                    }}
                  >
                    Theo dõi
                  </button>
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
            {suggestedUsers.length === 0 ? (
              <p className="text-sm text-gray-500">Không có gợi ý nào.</p>
            ) : (
              suggestedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => goToProfile(user.username)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatar || user.profilePictureUrl}
                      alt={user.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
