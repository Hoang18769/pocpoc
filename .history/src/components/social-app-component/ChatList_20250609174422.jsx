"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function ChatList({ chats, activeChat, onSelect }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    sidebarRef.current = document.querySelector("aside");
  }, []);

  if (!sidebarRef.current) return null;

  return createPortal(
    <div className="flex flex-col gap-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`p-2 rounded cursor-pointer ${
            activeChat?.id === chat.id ? "bg-gray-800" : "hover:bg-gray-700"
          }`}
          onClick={() => onSelect(chat)}
        >
          {chat.otherUsername}
        </div>
      ))}
    </div>,
    sidebarRef.current
  );
}
