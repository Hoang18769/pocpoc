"use client";

import { useState, useEffect } from "react";
import UserHeader from "@/components/social-app-component/UserHeader";
import api from "@/utils/api";

export default function FriendPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabTitles = {
    friends: "Bạn bè",
    requests: "Yêu cầu kết bạn",
    sent: "Đã gửi",
    suggestions: "Gợi ý",
    blocked: "Đã chặn"
  };

  // Các endpoint API tương ứng
  const apiEndpoints = {
    friends: "/v1/friends",
    sent: "/v1/friend-request/sent-request",
    requests: "/v1/friend-request/receive-requests",
    suggestions: "/v1/friends/suggested",
    blocked: "/v1/blocks"
  };

  // Hàm fetch data sử dụng API service
  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = apiEndpoints[activeTab] || apiEndpoints.friends;
      const response = await api.get(endpoint);
      setUsers(response.body || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      // Có thể thêm toast thông báo lỗi ở đây
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Hàm xử lý các hành động với API interception
  const handleAction = async (userId, actionType) => {
    try {
      let endpoint = "";
      let method = "post";
      let data = {};

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

      // Gọi API tương ứng
      await api[method](endpoint, data);
      
      // Cập nhật UI sau khi thành công
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // Có thể thêm toast thông báo thành công ở đây
      console.log(`${actionType} thành công cho user ${userId}`);
    } catch (error) {
      console.error(`Lỗi khi ${actionType}:`, error);
      // Có thể thêm toast thông báo lỗi ở đây
    }
  };

  // Render nút hành động (giữ nguyên như cũ)
  const renderActionButton = (user) => {
    // ... (giữ nguyên phần renderActionButton từ code trước)
  };

  return (
    // ... (giữ nguyên phần JSX từ code trước)
  );
}