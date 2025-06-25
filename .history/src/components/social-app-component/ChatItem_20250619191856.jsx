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
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition hover:bg-accent ${
        selected ? "bg-accent" : ""
      }`}
      data-chat-id={chatId}
    >
      <div className="relative">
        <Avatar src={target?.profilePictureUrl} alt={displayName} />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="font-medium truncate">{displayName}</p>
          {sentTime && (
            <span className="text-xs text-muted-foreground shrink-0">
              {sentTime}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground truncate">{latestMessage.deleted=true?"tin "content}</p>
          {notReadMessageCount > 0 && (
            <Badge variant="secondary" className="text-xs ml-2">
              {notReadMessageCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
