"use client";

import Avatar from "../ui-components/Avatar";

export default function UserHeader({
  user,
  variant = "post", 
  lastonline = true,
  isme = false,
  size = "large", // 'compact' | 'default' | 'large'
  className = "",
}) {
  const defaultUser = {
    name: "Name",
    avatar: "/placeholder.svg?height=100&width=100",
    lastOnline: "59 minutes ago",
  };

  const userData = { ...defaultUser, ...user };

  // Kích thước và spacing dựa trên prop size
  const sizeClasses = {
    compact: {
      container: "p-1.5",
      gap: "gap-1.5 sm:gap-2",
      text: {
        name: "text-xs sm:text-sm",
        lastOnline: "text-[10px] sm:text-xs"
      },
      icon: "w-3.5 h-3.5 sm:w-4 sm:h-4"
    },
    default: {
      container: "p-2",
      gap: "gap-2 sm:gap-3",
      text: {
        name: "text-xs sm:text-sm",
        lastOnline: "text-[10px] sm:text-xs"
      },
      icon: "w-4 h-4 sm:w-5 sm:h-5"
    },
    large: {
      container: "p-3",
      gap: "gap-3 sm:gap-4",
      text: {
        name: "text-sm sm:text-base",
        lastOnline: "text-xs"
      },
      icon: "w-5 h-5 sm:w-6 sm:h-6"
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div
      className={`flex items-center rounded-lg hover:bg-[var(--muted)] transition-colors ${currentSize.container} ${className}`}
    >
      {/* Avatar */}
      <Avatar
        src={userData.avatar}
        alt={userData.name}
        size={size === 'compact' ? 'sm' : size === 'large' ? 'lg' : 'md'}
        variant="default"
        className="flex-shrink-0"
      />

      {/* User info */}
      <div className={`ml-2 sm:ml-3 flex-grow min-w-0 ${currentSize.gap}`}>
        <h4 className={`font-medium text-[var(--foreground)] truncate ${currentSize.text.name}`}>
          {userData.familyName} {userData.givenName}
        </h4>

        {lastonline && (
          <p className={`text-[var(--muted-foreground)] truncate ${currentSize.text.lastOnline}`}>
            {userData.lastOnline}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className={`flex items-center flex-shrink-0 ${currentSize.gap}`}>
        {variant === "post" && isme && (
          <button className={`rounded-full hover:bg-[var(--accent)] transition-colors p-1`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`text-[var(--muted-foreground)] ${currentSize.icon}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        )}

        {variant === "post" && !isme && (
          <button className={`rounded-full hover:bg-[var(--accent)] transition-colors p-1`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`text-[var(--muted-foreground)] ${currentSize.icon}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        )}

        {variant === "chat" && (
          <button className={`rounded-full bg-[var(--accent)] hover:bg-[var(--muted)] transition-colors p-1`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`text-[var(--foreground)] ${currentSize.icon}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}