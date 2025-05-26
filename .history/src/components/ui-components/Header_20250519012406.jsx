import Link from "next/link";
import { Bell, Search, Plus, MessageCircle } from "lucide-react";
import Button from "./ui/Button"; // đường dẫn tới Button component của bạn

export default function Header({ className = "" }) {
  return (
    <header
      className={`w-full py-4 px-6 flex items-center justify-between bg-white dark:bg-black ${className}`}
    >
      {/* Left section - hiện để trống */}
      <div className="w-1/3" />

      {/* Center - Logo */}
      <div className="w-1/3 flex justify-center">
        <Link href="/" className="font-bold text-2xl text-black dark:text-white">
          pocpoc
        </Link>
      </div>

      {/* Right - Action buttons */}
      <div className="w-1/3 flex justify-end space-x-2 items-center">
        <Button
          variant="ghost"
          aria-label="Notifications"
          className="w-12 h-12 p-0 rounded-full"
        >
          <Bell size={20} className="text-black dark:text-white" />
        </Button>

        <Button
          variant="ghost"
          aria-label="Search"
          className="w-12 h-12 p-0 rounded-full"
        >
          <Search size={20} className="text-black dark:text-white" />
        </Button>

        <div
          role="group"
          aria-label="Add and Messages"
          className="h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center overflow-hidden"
        >
          <Button
            variant="ghost"
            aria-label="Add"
            className="w-12 h-12 p-0 rounded-none"
          >
            <Plus size={20} className="text-black dark:text-white" />
          </Button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

          <Button
            variant="ghost"
            aria-label="Messages"
            className="w-12 h-12 p-0 rounded-none"
          >
            <MessageCircle size={20} className="text-black dark:text-white" />
          </Button>
        </div>
      </div>
    </header>
  );
}
