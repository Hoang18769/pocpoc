"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Search, Play, Heart, User } from "lucide-react"

export default function SidebarNavigation({ mobile = false }) {
  const [activeItem, setActiveItem] = useState("home")

  const menuItems = [
    { id: "home", icon: Home, href: "/" },
    { id: "search", icon: Search, href: "/search" },
    { id: "videos", icon: Play, href: "/videos" },
    { id: "favorites", icon: Heart, href: "/favorites" },
    { id: "profile", icon: User, href: "/profile" },
  ]

  if (mobile) {
    // 📱 Mobile bottom bar
    return (
      <nav className="flex justify-around items-center h-14 bg-[var(--background)] text-[var(--foreground)]">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`flex flex-col items-center justify-center ${
                activeItem === item.id
                  ? "text-black dark:text-white"
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <Icon size={22} strokeWidth={activeItem === item.id ? 2.5 : 2} />
            </Link>
          )
        })}
      </nav>
    )
  }

  // 💻 Desktop vertical sidebar
  return (
    <div className="hidden md:flex w-[115px] h-[calc(100vh-64px)] sticky top-[64px] bg-gray-100 dark:bg-gray-800 rounded-full flex-col items-center justify-center text-[var(--foreground)]">
      <nav className="flex flex-col items-center space-y-10">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                activeItem === item.id
                  ? "text-black dark:text-white"
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <Icon size={24} strokeWidth={activeItem === item.id ? 2.5 : 2} />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
