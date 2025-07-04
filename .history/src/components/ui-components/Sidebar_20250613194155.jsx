"use client"

import {useEffect, useState } from "react"
import Link from "next/link"
import { Home, Search, Play, Heart, users, User, Settings, MessageCircle } from "lucide-react"

export default function SidebarNavigation() {
  const [activeItem, setActiveItem] = useState("home")
    const [username, setUsername] = useState(null)

  const menuItems = [
    { id: "home", icon: Home, href: "/index" },
    { id: "search", icon: Search, href: "/search" },
    { id: "message", icon: MessageCircle, href: "/chats" },
    { id: "favorites", icon: Users, href: "/favorites" },
    { id: "profile", icon: User, href: username ? `/profile/${username}` : "#" },
    { id: "setting", icon: Settings, href: "/settings" },
  ]
   useEffect(() => {
    const storedUsername = localStorage.getItem("userName")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  return (
    <div
      className={`
        z-50
        fixed bottom-0 left-0 w-full 
        flex  justify-around 
        md:static md:top-[64px] md:items-start md:h-full
        w-auto md:flex md:px-2 md:py-6
      `}
    >
      <nav className="bg-[var(--card)] p-4 md:rounded-xl flex flex-row md:flex-col items-center justify-around md:justify-center md:space-y-6 w-full md:w-full">
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
                    ? "text-black dark:bg-white"
                    : " text-black shadow hover:bg-white hover:text-black dark:hover:bg-white"
                }
              `}
            >
              <Icon
                size={24}
                strokeWidth={activeItem === item.id ? 3 : 2}
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
