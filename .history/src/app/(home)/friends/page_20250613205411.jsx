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
    // Lưu trạng thái cũ để rollback nếu có lỗi
    const previousUsers = [...users];
    
    // Optimistic update: cập nhật UI trước khi gọi API
    setUsers(prev => prev.filter(user => user.uuid !== userId));
    setActionLoading(prev => ({ ...prev, [userId]: true }));

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
      
      // Hiển thị thông báo thành công
      const successMessage = tabConfig[activeTab].successMessages[actionType];
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      console.error(`Lỗi khi ${actionType}:`, error);
      
      // Rollback UI nếu có lỗi
      setUsers(previousUsers);
      toast.error(`Lỗi khi thực hiện thao tác: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Render nút hành động
  const renderActionButton = (user) => {
    const isLoading = actionLoading[user.uuid];
    const baseClass = "px-3 py-1 text-sm rounded-md transition-colors flex items-center justify-center";

    const getButtonContent = (defaultText) => (
      isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {defaultText}
        </span>
      ) : defaultText
    );

    switch(activeTab) {
      case "friends":
        return (
          <button 
            onClick={() => handleAction(user.uuid, "unfriend")}
            disabled={isLoading}
            className={`${baseClass} bg-red-50 text-red-600 hover:bg-red-100 min-w-[100px]`}
          >
            {getButtonContent("Hủy kết bạn")}
          </button>
        );
      case "requests":
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleAction(user.uuid, "accept")}
              disabled={isLoading}
              className={`${baseClass} bg-blue-50 text-blue-600 hover:bg-blue-100 min-w-[100px]`}
            >
              {getButtonContent("Chấp nhận")}
            </button>
            <button 
              onClick={() => handleAction(user.uuid, "reject")}
              disabled={isLoading}
              className={`${baseClass} bg-gray-50 text-gray-600 hover:bg-gray-100 min-w-[80px]`}
            >
              {getButtonContent("Từ chối")}
            </button>
          </div>
        );
      case "sent":
        return (
          <button 
            onClick={() => handleAction(user.uuid, "cancel")}
            disabled={isLoading}
            className={`${baseClass} bg-gray-50 text-gray-600 hover:bg-gray-100 min-w-[120px]`}
          >
            {getButtonContent("Hủy yêu cầu")}
          </button>
        );
      case "suggestions":
        return (
          <button 
            onClick={() => handleAction(user.uuid, "add")}
            disabled={isLoading}
            className={`${baseClass} bg-green-50 text-green-600 hover:bg-green-100 min-w-[100px]`}
          >
            {getButtonContent("Thêm bạn")}
          </button>
        );
      case "blocked":
        return (
          <button 
            onClick={() => handleAction(user.uuid, "unblock")}
            disabled={isLoading}
            className={`${baseClass} bg-gray-50 text-gray-600 hover:bg-gray-100 min-w-[100px]`}
          >
            {getButtonContent("Bỏ chặn")}
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
              <li key={user.uuid} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <UserHeader 
                    user={user.user} 
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