"use client";

import { useState, useEffect } from "react";
import UserHeader from "@/components/social-app-component/UserHeader";
import api from "@/utils/axios";

export default function FriendPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Cấu hình các tab và API endpoint tương ứng
  const tabConfig = {
    friends: {
      title: "Bạn bè",
      endpoint: "/v1/friends",
      emptyMessage: "Bạn chưa có bạn bè nào"
    },
    requests: {
      title: "Yêu cầu kết bạn",
      endpoint: "/v1/friend-request/received-requests",
      emptyMessage: "Không có yêu cầu kết bạn nào"
    },  
    sent: {
      title: "Đã gửi",
      endpoint: "/v1/friend-request/sent-requests",
      emptyMessage: "Bạn chưa gửi yêu cầu kết bạn nào"
    },
    suggestions: {
      title: "Gợi ý",
      endpoint: "/v1/friends/suggested",
      emptyMessage: "Không có gợi ý nào"
    },
    blocked: {
      title: "Đã chặn",
      endpoint: "/v1/blocks",
      emptyMessage: "Bạn chưa chặn ai"
    }
  };

  // Fetch dữ liệu khi tab thay đổi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(tabConfig[activeTab].endpoint);
        setUsers(response.data.body || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Xử lý các hành động
  const handleAction = async (, actionType) => {
    setActionLoading(prev => ({ ...prev, []: true }));
    
    try {
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

      await api[method](endpoint, data);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error(`Lỗi khi ${actionType}:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Render nút hành động
  const renderActionButton = (user) => {
    const isLoading = actionLoading[user.id];
    const baseClass = "px-3 py-1 text-sm rounded-md transition-colors flex items-center justify-center";

    switch(activeTab) {
      case "friends":
        return (
          <button 
            onClick={() => handleAction(user.id, "unfriend")}
            disabled={isLoading}
            className={`${baseClass} bg-red-50 text-red-600 hover:bg-red-100 min-w-[100px]`}
          >
            {isLoading ? "Đang xử lý..." : "Hủy kết bạn"}
          </button>
        );
      case "requests":
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleAction(user.id, "accept")}
              disabled={isLoading}
              className={`${baseClass} bg-blue-50 text-blue-600 hover:bg-blue-100 min-w-[100px]`}
            >
              {isLoading ? "Đang xử lý..." : "Chấp nhận"}
            </button>
            <button 
              onClick={() => handleAction(user.id, "reject")}
              disabled={isLoading}
              className={`${baseClass} bg-gray-50 text-gray-600 hover:bg-gray-100 min-w-[80px]`}
            >
              {isLoading ? "..." : "Từ chối"}
            </button>
          </div>
        );
      case "sent":
        return (
          <button 
            onClick={() => handleAction(user.id, "cancel")}
            disabled={isLoading}
            className={`${baseClass} bg-gray-50 text-gray-600 hover:bg-gray-100 min-w-[120px]`}
          >
            {isLoading ? "Đang xử lý..." : "Hủy yêu cầu"}
          </button>
        );
      case "suggestions":
        return (
          <button 
            onClick={() => handleAction(user.id, "add")}
            disabled={isLoading}
            className={`${baseClass} bg-green-50 text-green-600 hover:bg-green-100 min-w-[100px]`}
          >
            {isLoading ? "Đang gửi..." : "Thêm bạn"}
          </button>
        );
      case "blocked":
        return (
          <button 
            onClick={() => handleAction(user.id, "unblock")}
            disabled={isLoading}
            className={`${baseClass} bg-gray-50 text-gray-600 hover:bg-gray-100 min-w-[100px]`}
          >
            {isLoading ? "Đang xử lý..." : "Bỏ chặn"}
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{tabConfig[activeTab].title}</h1>
      
      {/* Thanh tab */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {Object.keys(tabConfig).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabConfig[tab].title}
          </button>
        ))}
      </div>
      
      {/* Nội dung chính */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {tabConfig[activeTab].emptyMessage}
          </div>
        ) : (
          <ul className="divide-y">
            {users.map((user) => (
              <li key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <UserHeader 
                    user={user} 
                    variant="default" 
                    lastonline={activeTab === "friends"}
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