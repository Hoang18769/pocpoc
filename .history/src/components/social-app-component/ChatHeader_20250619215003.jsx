"use client";

import { ArrowLeft } from "lucide-react";
import Avatar from "../ui-components/Avatar";
import clsx from "clsx";

export default function ChatHeader({
  targetUser,
  isConnected,
  onBack,
  showBackButton
}) {
  return (
    <div className="flex items-center gap-3 p-3 py-1 border-b border-[var(--border)]">
        <button
          onClick={onBack}
          className="text-[var(--muted-foreground)] hover:text-foreground"
        >
          <ArrowLeft className="w-3 h-3" />
        </button>
      )}
      
      <Avatar src={targetUser?.profilePictureUrl} size="sm" />
      
      <div className="flex-1">
        <div className="font-semibold text-base">{targetUser?.givenName}</div>
        <div className="text-sm text-[var(--muted-foreground)]">
          {targetUser?.online ? "Online" : "offline"}
          <span className="ml-2">{isConnected ? "🟢" : "🔴"}</span>
        </div>
      </div>
    </div>
  );
}