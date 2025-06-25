"use client";

import { useState, useEffect } from "react";
import UserHeader from "@/components/social-app-component/UserHeader";

export default function FriendPage() {
  // State quản lý tab hiện tại
  const [activeTab, setActiveTab] = useState("friends");
  // State quản lý dữ liệu người dùng
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabTitles = {
    friends: "Bạn bè",
    requests: "Yêu cầu kết bạn",
    sent: "Đã gửi",
    suggestions: "Gợi ý",
    blocked: "Đã chặn"
  };

  // Fetch dữ liệu tương ứng với tab hiện tại
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = "";
        
        // Xác định endpoint dựa trên tab hiện tại
        switch(activeTab) {
          case "friends":
            endpoint = "/v1/friends";
            break;
          case "sent-requests":
            endpoint = "/v1/friend-request/sent-request";
            break;
          case "receive-requests":
            endpoint = "/v1/friend-request/receive-requests";
            break;
          case "suggestions":
            endpoint = "/v1/friend";
            break;
          case "blocked":
            endpoint = "/api/blocked-users";
            break;
          default:
            endpoint = "/api/friends";
        }

        // Giả lập API call - thay thế bằng API thực tế của bạn
        const response = await fetch(endpoint);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Hàm xử lý các hành động (kết bạn, hủy kết bạn, chặn,...)
  const handleAction = (userId, actionType) => {
    // Cập nhật UI ngay lập tức
    setUsers(prevUsers => {
      if (actionType === "unfriend" || actionType === "reject" || actionType === "cancel" || actionType === "unblock") {
        return prevUsers.filter(user => user.id !== userId);
      }
      return prevUsers;
    });

    // Gọi API thực hiện hành động (giả lập)
    console.log(`Thực hiện hành động ${actionType} cho user ${userId}`);
  };

  // Render nút hành động tùy theo tab hiện tại
  const renderActionButton = (user) => {
    switch(activeTab) {
      case "friends":
        return (
          <button 
            onClick={() => handleAction(user.id, "unfriend")}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
          >
            Hủy kết bạn
          </button>
        );
      case "requests":
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleAction(user.id, "accept")}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Chấp nhận
            </button>
            <button 
              onClick={() => handleAction(user.id, "reject")}
              className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
            >
              Từ chối
            </button>
          </div>
        );
      case "sent":
        return (
          <button 
            onClick={() => handleAction(user.id, "cancel")}
            className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
          >
            Hủy yêu cầu
          </button>
        );
      case "suggestions":
        return (
          <button 
            onClick={() => handleAction(user.id, "add")}
            className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100"
          >
            Thêm bạn
          </button>
        );
      case "blocked":
        return (
          <button 
            onClick={() => handleAction(user.id, "unblock")}
            className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
          >
            Bỏ chặn
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tiêu đề trang - thay đổi theo tab */}
      <h1 className="text-2xl font-bold mb-6">{tabTitles[activeTab]}</h1>
      
      {/* Thanh tab */}
      <div className="flex border-b mb-6">
        {Object.keys(tabTitles).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabTitles[tab]}
          </button>
        ))}
      </div>
      
      {/* Nội dung chính */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {activeTab === "friends" && "Bạn chưa có bạn bè nào"}
            {activeTab === "requests" && "Không có yêu cầu kết bạn nào"}
            {activeTab === "sent" && "Bạn chưa gửi yêu cầu kết bạn nào"}
            {activeTab === "suggestions" && "Không có gợi ý nào"}
            {activeTab === "blocked" && "Bạn chưa chặn ai"}
          </div>
        ) : (
          <ul className="divide-y">
            {users.map((user) => (
              <li key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  {/* Sử dụng UserHeader component */}
                  <UserHeader 
                    user={user} 
                    variant="default" 
                    lastonline={activeTab === "friends"}
                    className="flex-grow"
                  />
                  
                  {/* Nút hành động */}
                  <div className="ml-4">
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