"use client";

import Avatar from "../ui-components/Avatar";

export default function UserHeader({
  user = {},
  showLastOnline = true,
  className = "",
}) {
  const { familyName = "", givenName = "", avatar, lastOnline } = user;

  return (
    <div className={`flex items-center p-2 rounded-lg hover:bg-[var(--muted)] transition-colors ${className}`}>
      <Avatar
        src={avatar || "/placeholder.svg"}
        alt={`${familyName} ${givenName}`}
        size="md"
        className="flex-shrink-0"
      />

      <div className="ml-2 sm:ml-3 flex-grow min-w-0">
        <h4 className="text-sm sm:text-base font-medium text-[var(--foreground)] truncate">
          {familyName}{" "}{givenName}
        </h4>
        
        {showLastOnline && (
          <p className="text-xs text-[var(--muted-foreground)] truncate">
            {lastOnline || "Online"}
          </p>
        )}
      </div>

      <button 
        className="p-1 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
        aria-label="More options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </div>
  );
}