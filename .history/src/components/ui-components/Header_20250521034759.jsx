import Link from "next/link";
import { Bell, Search, Plus, MessageCircle } from "lucide-react";
import Badge from "@/components/ui-components/Badge"
import ThemeToggle from "./Themetoggle";
export default function Header({ className = "" }) {
  return (
    <header
  className="w-full px-6 flex items-center justify-between bg-[var(--background)] "
  style={{ height: "64px", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
>
      <div className="w-1/3">{/* Left section - empty in this design */}</div>

      {/* Center - Logo */}
      <div className="w-1/3 flex justify-center">
        <Link href="/" className="font-bold text-2xl text-[var(foreground)]">
          pocpoc
        </Link>
      </div>

      {/* Right - Action buttons */}
      <div className="w-1/3 flex justify-end space-x-2 items-center ">
        <ThemeToggle/>
      
        <button
          type="button"
          aria-label="Notifications"
          className="w-12 h-12 bg-[var(--card)] rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition relative"
        >
          <Bell size={20} className="text-[var(--foreground)]" />
         <Badge asNotification>{7}</Badge>
        </button>

        <button
          type="button"
          aria-label="Search"
          className="w-12 h-12 bg-[var(--card)] rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          <Search size={20} className="text-[var(--foreground)]" />
        </button>

        <div
          role="group"
          aria-label="Add and Messages"
          className="h-12 bg-[var(--card)] rounded-full flex items-center"
        >
          <button
            type="button"
            aria-label="Add"
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition rounded-l-full"
          >
            <Plus size={20} className="text-[var(--foreground)]" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

          <button
            type="button"
            aria-label="Messages"
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition rounded-r-full"
          >
            <MessageCircle size={20} className="text-[var(--foreground)]" />
          </button>
        </div>
      </div>
    </header>
  );
}
