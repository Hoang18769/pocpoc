import Link from "next/link";
import { Bell, Search, Plus, MessageCircle } from "lucide-react";

export default function Header({ className = "" }) {
  return (
    <header
      className={`w-full py-4 px-6 flex items-center justify-between bg-white dark:bg-black ${className}`}
    >
      <div className="w-1/3">{/* Left section - empty in this design */}</div>

      {/* Center - Logo */}
      <div className="w-1/3 flex justify-center">
        <Link href="/" className="font-bold text-2xl text-black dark:text-white">
          pocpoc
        </Link>
      </div>

      {/* Right - Action buttons */}
      <div className="w-1/3 flex justify-end space-x-2 items-center">
        <button
          type="button"
          aria-label="Notifications"
          className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          <Bell size={20} className="text-black dark:text-white" />
        </button>

        <button
          type="button"
          aria-label="Search"
          className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          <Search size={20} className="text-black dark:text-white" />
        </button>

        <div
          role="group"
          aria-label="Add and Messages"
          className="h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center"
        >
          <button
            type="button"
            aria-label="Add"
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition rounded-l-full"
          >
            <Plus size={20} className="text-black dark:text-white" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

          <button
            type="button"
            aria-label="Messages"
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition rounded-r-full"
          >
            <MessageCircle size={20} className="text-black dark:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
