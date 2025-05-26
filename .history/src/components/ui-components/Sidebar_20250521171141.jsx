"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Search, Play, Heart, User } from "lucide-react"

export default function SidebarNavigation() {
  const [activeItem, setActiveItem] = useState("home")

  const menuItems = [
    { id: "home", icon: Home, href: "/" },
    { id: "search", icon: Search, href: "/search" },
    { id: "videos", icon: Play, href: "/videos" },
    { id: "favorites", icon: Heart, href: "/favorites" },
    { id: "profile", icon: User, href: "/profile" },
  ]

  return (
    <div
      className={`
        z-50
        fixed bottom-0 left-0 w-full h-16 bg-[var(--card)] border-t
        flex items-center justify-around
        -2
        md:static md:top-[64px] md:h-[calc(100vh-64px)] 
        md:w-auto md:flex-col md:items-start md:justify-start md:border-r md:border-t-0 md:px-4 md:py-6
      `}
    >
      <nav className="flex flex-row md:flex-col items-center justify-between md:justify-start md:space-y-6 w-full md:w-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`
                w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  activeItem === item.id
                    ? "text-black dark:text-white"
                    : "text-gray-500 hover:text-black dark:hover:text-white"
                }
              `}
            >
              <Icon
                size={24}
                strokeWidth={activeItem === item.id ? 2.5 : 2}
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
