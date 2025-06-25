"use client";

import UserHeader from "./UserHeader";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

interface UserListItemProps {
  user: User;
  variant?: "friend" | "request" | "sent" | "blocked" | "suggestion";
  onAction?: () => void;
}

export default function UserListItem({ user, variant = "friend", onAction }: UserListItemProps) {
  const getActionButton = () => {
    switch (variant) {
      case "friend":
        return (
          <Button variant="outline" size="sm" onClick={onAction}>
            Hủy kết bạn
          </Button>
        );
      case "request":
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={onAction}>
              Chấp nhận
            </Button>
            <Button variant="outline" size="sm" onClick={onAction}>
              Từ chối
            </Button>
          </div>
        );
      case "sent":
        return (
          <Button variant="outline" size="sm" onClick={onAction}>
            Hủy yêu cầu
          </Button>
        );
      case "blocked":
        return (
          <Button variant="outline" size="sm" onClick={onAction}>
            Bỏ chặn
          </Button>
        );
      case "suggestion":
        return (
          <Button size="sm" onClick={onAction}>
            Thêm bạn
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <UserHeader 
        user={user} 
        size="default" 
        lastonline={variant === "friend"}
        className="flex-grow"
      />
      <div className="ml-4">
        {getActionButton()}
      </div>
    </div>
  );
}