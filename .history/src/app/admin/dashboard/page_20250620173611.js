"use client"

import api from "@/utils/axios"
import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  Users,
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Paperclip,
  TrendingUp,
  Calendar,
  Clock,
  Eye,
  UserCheck,
  UserX,
  Globe,
  Lock,
} from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [usersData, setUsersData] = useState(null)
  const [postsData, setPostsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchUsersStatistics = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await api.get("/v1/statistics/users")
      setUsersData(res.data.body)
    } catch (err) {
      setError(`Không thể tải thống kê users: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchPostsStatistics = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await api.get("/v1/statistics/posts")
      setPostsData(res.data.body)
    } catch (err) {
      setError(`Không thể tải thống kê posts: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsersStatistics()
    } else if (activeTab === "posts") {
      fetchPostsStatistics()
    }
  }, [activeTab])

  // Transform data for charts
  const transformWeeklyData = (data) => {
    if (!data) return []
    return Object.entries(data).map(([day, value]) => ({
      day: day.substring(0, 3),
      value: value || 0,
    }))
  }

  const transformMonthlyData = (data) => {
    if (!data) return []
    return Object.entries(data)
      .slice(0, 15)
      .map(([date, value]) => ({
        date: `Day ${date}`,
        value: value || 0,
      }))
  }

  const transformYearlyData = (data) => {
    if (!data) return []
    return Object.entries(data).map(([month, value]) => ({
      month: month.substring(0, 3),
      value: value || 0,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div
      className={`bg-gradient-to-r ${color} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-white/90">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">{trend}</span>
            </div>
          )}
        </div>
        <Icon className="w-12 h-12 text-white/80" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan thống kê hệ thống</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "users"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-blue-500 hover:bg-blue-50"
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Users Analytics
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "posts"
                ? "bg-green-500 text-white shadow-md"
                : "text-gray-600 hover:text-green-500 hover:bg-green-50"
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Posts Analytics
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && usersData && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={usersData.totalUsers}
                icon={Users}
                color="from-blue-500 to-blue-600"
                trend={`+${usersData.newUsersThisMonth} this month`}
              />
              <StatCard
                title="Online Now"
                value={usersData.onlineUsersNow}
                icon={Eye}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="New Today"
                value={usersData.newUsersToday}
                icon={UserCheck}
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Not Verified"
                value={usersData.notVerifiedUsers}
                icon={UserX}
                color="from-orange-500 to-orange-600"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  Weekly Growth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transformWeeklyData(usersData.thisWeekStatistics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Trend */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Monthly Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={transformMonthlyData(usersData.thisMonthStatistics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yearly Overview */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-500" />
                Yearly Overview
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={transformYearlyData(usersData.thisYearStatistics)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && postsData && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Posts"
                value={postsData.totalPosts}
                icon={FileText}
                color="from-indigo-500 to-indigo-600"
                trend={`+${postsData.newPostsThisMonth} this month`}
              />
              <StatCard
                title="Total Likes"
                value={postsData.totalLikes}
                icon={Heart}
                color="from-pink-500 to-pink-600"
              />
              <StatCard
                title="Comments"
                value={postsData.totalComments}
                icon={MessageCircle}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Shares"
                value={postsData.totalShares}
                icon={Share2}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="Files"
                value={postsData.totalFiles}
                icon={Paperclip}
                color="from-yellow-500 to-yellow-600"
              />
            </div>

            {/* Engagement Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Engagement Pie Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Engagement Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Likes", value: postsData.totalLikes },
                        { name: "Comments", value: postsData.totalComments },
                        { name: "Shares", value: postsData.totalShares },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {[
                        { name: "Likes", value: postsData.totalLikes },
                        { name: "Comments", value: postsData.totalComments },
                        { name: "Shares", value: postsData.totalShares },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Posts */}
              <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  Weekly Posts Activity
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={transformWeeklyData(postsData.thisWeekStatistics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hottest Posts */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-6 flex items-center">🔥 Hottest Posts Today</h3>
              {postsData.hottestTodayPosts && postsData.hottestTodayPosts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {postsData.hottestTodayPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {post.author.givenName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {post.author.givenName} {post.author.familyName}
                            </p>
                            <p className="text-sm text-gray-500">@{post.author.username}</p>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${post.author.isOnline ? "bg-green-400" : "bg-gray-300"}`}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.privacy === "PUBLIC" ? (
                            <Globe className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {post.content && <p className="text-gray-700 mb-3 bg-white p-3 rounded-lg">{post.content}</p>}

                      {post.files && post.files.length > 0 && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-blue-600">
                            <Paperclip className="w-4 h-4 mr-1" />
                            <span className="text-sm">{post.files.length} file(s) attached</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-pink-500">
                            <Heart className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">{post.likeCount}</span>
                          </div>
                          <div className="flex items-center text-blue-500">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">{post.commentCount}</span>
                          </div>
                          <div className="flex items-center text-green-500">
                            <Share2 className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">{post.shareCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500">Không có bài viết hot hôm nay</p>
                </div>
              )}
            </div>

            {/* Monthly & Yearly Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Monthly Posts
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={transformMonthlyData(postsData.thisMonthStatistics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Yearly Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-500" />
                  Yearly Posts
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transformYearlyData(postsData.thisYearStatistics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
