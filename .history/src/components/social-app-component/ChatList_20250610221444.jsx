import React from "react";
import Image from "next/image";
import useChatList from "@/hooks/useChatList";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function UserAvatars({ compact = true }) {
  const { chats, loading, error } = useChatList();
  const [expanded, setExpanded] = React.useState(false);

  if (loading) return <div className="flex gap-1">Loading...</div>;
  if (error) return <div className="text-red-500">Error loading chats</div>;

  // Filter out chats without users and get unique users
  const users = chats
    .flatMap(chat => chat.participants || [])
    .filter((user, index, self) => 
      user?.avatar && self.findIndex(u => u.id === user.id) === index
    );

  // Determine which users to show based on mode
  const usersToShow = compact && !expanded ? users.slice(0, 3) : users;
  const remainingCount = users.length - 3;

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      {usersToShow.map((user) => (
        <div 
          key={user.id} 
          className={`relative ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
          title={user.name}
        >
          <Image
            src={user.avatar}
            alt={user.name}
            fill
            className="rounded-full object-cover"
            sizes={compact ? "32px" : "40px"}
          />
        </div>
      ))}

      {compact && remainingCount > 0 && !expanded && (
        <button 
          onClick={() => setExpanded(true)}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs"
        >
          +{remainingCount}
        </button>
      )}

      {compact && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {expanded ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
}