"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import vi from "date-fns/locale/vi";
import { Dot } from "lucide-react";

export default function ChatItem({ chat }) {
  const { chatId, name, latestMessage, target, notReadMessageCount } = chat;
  const isOnline = target.online;

  const displayName = `${target.givenName} ${target.familyName}`;
  const senderPrefix =
    latestMessage.sender.id === target.id ? "" : "Bạn: ";

  const content =
    latestMessage.attachment
      ? "[Tệp đính kèm]"
      : latestMessage.content?.slice(0, 60) || "Tin nhắn đã bị xoá";

  const sentTime = formatDistanceToNow(new Date(latestMessage.sentAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition cursor-pointer"
      data-chat-id={chatId}
    >
      <div className="relative">
       
        <Avatar src={target.profilePictureUrl} alt={displayName}/>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="font-medium truncate">{displayName}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            {sentTime}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground truncate">
            {senderPrefix + content}
          </p>
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
