"use client";

import Avatar from "../ui-components/Avatar";
import Badge from "../ui-components/Badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

// Kích hoạt plugin và đặt ngôn ngữ
dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function ChatItem({ chat, onClick, selected }) {
  const { chatId, latestMessage, target, notReadMessageCount } = chat;
  const isOnline = target?.online;

  const displayName = `${target?.givenName || ""} ${target?.familyName || ""}`;

  let content = "Chưa có tin nhắn nào";
  let sentTime = "";

  if (latestMessage) {
    const senderPrefix =
      latestMessage.sender?.id === target?.id ? "" : "Bạn: ";
    content =
      latestMessage.attachment
        ? "[Tệp đính kèm]"
        : latestMessage.content?.slice(0, 60) || "Tin nhắn đã bị xoá";
    sentTime = dayjs(latestMessage.sentAt).fromNow();
    content = senderPrefix + content;
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
        selected ? "bg-blue-50 border-r-2 border-blue-500" : ""
      }`}
      onClick={() => onClick(chatId)}
    >
      <div className="relative flex-shrink-0">
        <Avatar src={target?.avatar} name={displayName} size="md" />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      {/* Message content - hidden on md and below */}
      <div className="flex-1 min-w-0 hidden md:block">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900 truncate">
            {displayName}
          </h3>
          {sentTime && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {sentTime}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">
            {latestMessage?.deleted === "true" ? "tin nhắn đã bị thu hồi" : content}
          </p>
          {notReadMessageCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-2 flex-shrink-0">
              {notReadMessageCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Badge for unread messages - visible on mobile, positioned over avatar */}
      {notReadMessageCount > 0 && (
        <div className="md:hidden absolute top-2 right-2">
          <Badge variant="primary" size="sm">
            {notReadMessageCount}
          </Badge>
        </div>
      )}
    </div>
  );
}