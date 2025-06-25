"use client";

import { useState, useEffect } from "react";
import UserHeader from "@/components/social-app-component/UserHeader";
import api from "@/utils/axios";
import toast from "react-hot-toast";

export default function FriendPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const tabConfig = {
    friends: {
      title: "Bạn bè",
      endpoint: "/v1/friends",
      emptyMessage: "Bạn chưa có bạn bè nào",
      successMessages: {
        unfriend: "Đã hủy kết bạn thành công"
      }
    },
    requests: {
      title: "Yêu cầu kết bạn",
      endpoint: "/v1/friend-request/received-requests",
      emptyMessage: "Không có yêu cầu kết bạn nào",
      successMessages: {
        accept: "Đã chấp nhận yêu cầu kết bạn",
        reject: "Đã từ chối yêu cầu kết bạn"
      }
    },  
    sent: {
      title: "Đã gửi",
      endpoint: "/v1/friend-request/sent-requests",
      emptyMessage: "Bạn chưa gửi yêu cầu kết bạn nào",
      successMessages: {
        cancel: "Đã hủy yêu cầu kết bạn"
      }
    },
    suggestions: {
      title: "Gợi ý",
      endpoint: "/v1/friends/suggested",
      emptyMessage: "Không có gợi ý nào",
      successMessages: {
        add: "Đã gửi yêu cầu kết bạn thành công"
      }
    },
    blocked: {
      title: "Đã chặn",
      endpoint: "/v1/blocks",
      emptyMessage: "Bạn chưa chặn ai",
      successMessages: {
        unblock: "Đã bỏ chặn thành công"
      }
    }
  };

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(tabConfig[activeTab].endpoint);
        setUsers(response.data.body || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Xử lý hành động với Optimistic UI
  const handleAction = async (userId, actionType) => {
    const previousUsers = [...users];
    setUsers(prev => prev.filter(user => user.uuid !== userId));
    setActionLoading(prev => ({ ...prev, [userId]: true }));

    try {
      let config = {};
      let endpoint, method = "post", data = {};

      switch (actionType) {
        case "unfriend":
          endpoint = `/v1/friends/${userId}`;
          method = "delete";
          break;
        case "accept":
          endpoint = `/v1/friend-request/accept/${userId}`;
          break;
        case "reject":
          endpoint = `/v1/friend-request/reject/${userId}`;
          method = "delete";
          break;
        case "cancel":
          endpoint = `/v1/friend-request/cancel/${userId}`;
          method = "delete";
          break;
        case "add":
          endpoint = "/v1/friend-request/send";
          data = { receiverId: userId };
          break;
        case "unblock":
          endpoint = `/v1/blocks/${userId}`;
          method = "delete";
          break;
        default:
          return;
      }

      await api[method](endpoint, data, config);
      toast.success(tabConfig[activeTab].successMessages[actionType]);
    } catch (error) {
      setUsers(previousUsers);
      toast.error(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Render nút hành động
  const renderActionButton = (user) => {
    const isLoading = actionLoading[user.uuid];
    const baseClass = "px-3 py-1 text-sm rounded-md transition-colors flex items-center justify-center min-w-[100px]";

    const buttonConfig = {
      friends: { text: "Hủy kết bạn", style: "bg-red-50 text-red-600 hover:bg-red-100" },
      requests: [
        { text: "Chấp nhận", style: "bg-blue-50 text-blue-600 hover:bg-blue-100", action: "accept" },
        { text: "Từ chối", style: "bg-gray-50 text-gray-600 hover:bg-gray-100", action: "reject", minWidth: "min-w-[80px]" }
      ],
      sent: { text: "Hủy yêu cầu", style: "bg-gray-50 text-gray-600 hover:bg-gray-100" },
      suggestions: { text: "Thêm bạn", style: "bg-green-50 text-green-600 hover:bg-green-100" },
      blocked: { text: "Bỏ chặn", style: "bg-gray-50 text-gray-600 hover:bg-gray-100" }
    };

    const currentConfig = buttonConfig[activeTab];

    if (Array.isArray(currentConfig)) {
      return (
        <div className="flex gap-2">
          {currentConfig.map((btn) => (
            <button
              key={btn.action}
              onClick={() => handleAction(user.uuid, btn.action)}
              disabled={isLoading}
              className={`${baseClass} ${btn.style} ${btn.minWidth || ""}`}
            >
              {isLoading ? "..." : btn.text}
            </button>
          ))}
        </div>
      );
    }

    return (
      <button
        onClick={() => handleAction(user.uuid, activeTab === "friends" ? "unfriend" : 
                                  activeTab === "sent" ? "cancel" : 
                                  activeTab === "suggestions" ? "add" : "unblock")}
        disabled={isLoading}
        className={`${baseClass} ${currentConfig.style}`}
      >
        {isLoading ? "..." : currentConfig.text}
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{tabConfig[activeTab].title}</h1>
      
      {/* Thanh tab */}
      <div className="flex border-b border-[var(--border)] mb-6 overflow-x-auto">
        {Object.keys(tabConfig).map((tab) => (
  <button
    key={tab}
    className={`px-4 py-2 whitespace-nowrap transition-all duration-200 ${
      activeTab === tab
        ? "text-[var(--foreground)] font-bold border-b-[3px] border-[var(--primary)]"
        : "text-[var(--muted-foreground)] font-medium hover:text-[var(--foreground)]"
    }`}
    onClick={() => setActiveTab(tab)}
  >
    {tabConfig[tab].title}
  </button>
))}
      </div>
      
      {/* Nội dung chính */}
      <div className="bg-[var(--card)] rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-4 w-32 bg-[var(--muted)] rounded"></div>
              <div className="h-4 w-64 bg-[var(--muted)] rounded"></div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">
            {tabConfig[activeTab].emptyMessage}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {users.map((user) => (
              <li key={user.uuid} className="p-4 hover:bg-[var(--accent)] transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <UserHeader 
                    user={user.user} 
                    showLastOnline={activeTab === "friends"}
                    className="flex-grow min-w-0"
                  />
                  
                  <div className="ml-4 flex-shrink-0">
                    {renderActionButton(user)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}