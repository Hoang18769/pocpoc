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
        flex md:flex-col items-center justify-around 
        bg-gray-100 dark:bg-gray-800 
        text-[var(--foreground)]
        rounded-none md:rounded-full
        fixed bottom-0 w-full h-14 
        md:static md:w-[115px] md:h-[calc(100vh-64px)] md:sticky md:top-[64px]
         
        z-50
      `}
    >
     <div>
      
     </div>
    </div>
  )
}
