"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsersStatistics = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/v1/statistics/users"); // Gọi API
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setData(json.body); // lấy trường body từ response
      } catch (err) {
        setError(`Không thể tải thống kê: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsersStatistics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-2 border-b-2 ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent hover:text-primary"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-2 border-b-2 ${
            activeTab === "posts"
              ? "border-primary text-primary"
              : "border-transparent hover:text-primary"
          }`}
        >
          Posts
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary */}
          <section className="bg-card border border-border p-4 rounded-lg space-y-2 shadow">
            <h2 className="text-xl font-semibold mb-2">User Overview</h2>
            <p>👥 Total Users: {data.totalUsers}</p>
            <p>❓ Not Verified Users: {data.notVerifiedUsers}</p>
            <p>🆕 New Users Today: {data.newUsersToday}</p>
            <p>🆕 New Users This Week: {data.newUsersThisWeek}</p>
            <p>🆕 New Users This Month: {data.newUsersThisMonth}</p>
            <p>🆕 New Users This Year: {data.newUsersThisYear}</p>
            <p>🟢 Online Users Now: {data.onlineUsersNow}</p>
          </section>

          {/* This Week Statistics */}
          <section className="bg-card border border-border p-4 rounded-lg space-y-2 shadow">
            <h2 className="text-xl font-semibold mb-2">This Week Statistics</h2>
            {Object.entries(data.thisWeekStatistics || {}).map(
              ([day, value]) => (
                <p key={day} className="flex justify-between">
                  <span>{day}</span>
                  <span>{value !== null ? value : "N/A"}</span>
                </p>
              )
            )}
          </section>

          {/* This Month Statistics */}
          <section className="bg-card border border-border p-4 rounded-lg space-y-2 shadow col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-2">This Month Statistics</h2>
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              {Object.entries(data.thisMonthStatistics || {}).map(
                ([date, value]) => (
                  <div key={date} className="bg-muted/50 p-2 rounded">
                    <div>Day {date}</div>
                    <div>{value !== null ? value : "-"}</div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* This Year Statistics */}
          <section className="bg-card border border-border p-4 rounded-lg space-y-2 shadow col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-2">This Year Statistics</h2>
            {Object.entries(data.thisYearStatistics || {}).map(
              ([month, value]) => (
                <p key={month} className="flex justify-between">
                  <span>{month}</span>
                  <span>{value !== null ? value : "-"}</span>
                </p>
              )
            )}
          </section>
        </div>
      )}

      {activeTab === "posts" && (
        <div className="bg-card border border-border p-4 rounded-lg space-y-2 shadow">
          <h2 className="text-xl font-semibold mb-2">Posts Overview</h2>
          <p>🔄 Nội dung thống kê bài viết bạn cần tự tích hợp.</p>
        </div>
      )}
    </div>
  );
}
