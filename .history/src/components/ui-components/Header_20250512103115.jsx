import Link from "next/link"
import { Bell, Search, Plus, MessageCircle } from "lucide-react"

export default function Header() {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-white dark:bg-black">
      <div className="w-1/3">{/* Left section - empty in this design */}</div>

      {/* Center - Logo */}
      <div className="w-1/3 flex justify-center">
        <Link href="/" className="font-bold text-2xl text-black dark:text-white">
          pocpoc
        </Link>
      </div>

      {/* Right - Action buttons */}
      <div className="w-1/3 flex justify-end space-x-2">
        <button className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Bell size={20} className="text-black dark:text-white" />
        </button>

        <button className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Search size={20} className="text-black dark:text-white" />
        </button>

        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center">
          <button className="w-12 h-12 flex items-center justify-center">
            <Plus size={20} className="text-black dark:text-white" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

          <button className="w-12 h-12 flex items-center justify-center">
            <MessageCircle size={20} className="text-black dark:text-white" />
          </button>
        </div>
      </div>
    </header>
  )
}
