"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import useClient from "@/hooks/useClient"

export default function PostCard({ user, timestamp, content, image, likes, comments }) {
  const isClient = useClient()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const formatLikes = (num) => {
    return num > 999 ? `${(num / 1000).toFixed(1)}k` : num.toString()
  }

  return (
    <div className="bg-gray-100 dark:bg-[var(--card)] rounded-xl p-4 max-w-3xl mx-auto shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={user.avatar || "/placeholder.svg?height=40&width=40"}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>
        <button className="p-1">
          <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className={`${image ? "md:w-1/2" : "w-full"}`}>
          <p className="text-sm mb-3">{content}</p>

          <div className="flex items-center gap-2 mt-2">
            <button className="p-1" onClick={() => setLiked(!liked)}>
              <Heart className={`w-5 h-5 ${isClient && liked ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"}`} />
            </button>
            <button className="p-1">
              <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-1">
              <Send className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-1 ml-auto" onClick={() => setSaved(!saved)}>
              <Bookmark className={`w-5 h-5 ${isClient && saved ? "fill-gray-600 text-gray-600" : "text-gray-600 dark:text-gray-300"}`} />
            </button>
          </div>

          {isClient && (
            <p className="text-sm font-medium mt-2">{formatLikes(likes)} likes</p>
          )}
        </div>

        {image ? (
          <div className="md:w-1/2 relative bg-pink-200 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="aspect-square relative">
              <Image src={image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
              <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-1 rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-1 rounded-full">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-pink-200 dark:bg-gray-800 rounded-lg p-6 flex items-center justify-center">
            <p className="text-lg font-medium">{content}</p>
          </div>
        )}
      </div>

      {comments && comments.length > 0 && (
        <div className="mt-4 border-t pt-3 border-gray-200 dark:border-gray-600">
          {comments.slice(0, 1).map((comment, index) => (
            <div key={index} className="flex items-start gap-2 mb-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={comment.user.avatar || "/placeholder.svg?height=24&width=24"}
                  alt={comment.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-medium">{comment.user.name}</span> {comment.content}
                  </p>
                  <button className="p-1">
                    <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 dark:text-gray-400">
                  <span>{comment.timestamp}</span>
                  <span>{comment.likes} likes</span>
                  <button className="font-medium">Reply</button>
                </div>
              </div>
              <button className="p-1">
                <Heart className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          ))}

          {comments.length > 1 && (
            <button className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              View Replies ({comments.length - 1})
            </button>
          )}

          <button className="text-xs text-gray-500 mt-2 dark:text-gray-400">
            View all {comments.length} comments
          </button>

          <button className="w-full mt-3 py-2 text-center text-sm text-gray-500 border border-gray-300 rounded-full dark:border-gray-600 dark:text-gray-300">
            Scroll down to read others comments
          </button>
        </div>
      )}
    </div>
  )
}
