"use client"
import Image from "next/image"
import { useState } from "react"
import Avatar from "../ui-components/Avatar"

export default function ProfileHeader({
  name = "Huynh Huy Hoang",
  username = "@amanxux",
  avatar = "/avatar-placeholder.png",
  bio = "Bio",
  posts = 225,
  friends = 225,
  link = "https://linktr.ee/amanxux",
  isOwnProfile = true
}) {
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <div className="w-full">
      {/* Info Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6">
        <Avatar
          alt="Avatar"
          width={112}
          height={112}
          className="rounded-full object-cover w-24 h-24 sm:w-28 sm:h-28"
        />

        <div className="flex-1">
          {/* Name and Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">{name}</h2>
            {isOwnProfile ? (
              <button className="px-4 py-1 border rounded-full text-sm text-gray-600 hover:bg-gray-100">
                Edit Profile
              </button>
            ) : (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Add Friend
              </button>
            )}
          </div>

          <p className="text-gray-500 text-sm">{username}</p>

          <div className="flex gap-4 mt-1 text-sm">
            <span><strong>{posts}</strong> Posts</span>
            <span><strong>{friends}</strong> Friends</span>
          </div>

          <p className="text-sm mt-2 text-gray-700">{bio}</p>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline block mt-1"
          >
            {link}
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around text-sm border-t mt-4 pt-2">
        <button
          className={`flex items-center gap-1 ${
            activeTab === "posts"
              ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={() => setActiveTab("posts")}
        >
          🧱 POSTS
        </button>
        <button
          className={`flex items-center gap-1 ${
            activeTab === "photos"
              ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={() => setActiveTab("photos")}
        >
          🖼 Photos
        </button>
        <button
          className="flex items-center gap-1 text-gray-400 cursor-not-allowed"
          disabled
        >
          💾 SAVED
        </button>
      </div>
    </div>
  )
}
