"use client";

import Image from "next/image";
import Avatar from "../ui-components/Avatar";
import Card from "../ui-components/Card";
import { Heart } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../ui-components/Modal";
import { useState } from "react";
export default function PostCard({ post, size = "default", className = "" }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  const closeModal = () => {
    setActiveImageIndex(null);
  };

  const showNextImage = () => {
    if (post.images && activeImageIndex < post.images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };

  const showPrevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  return (
    <Card className={`flex flex-col p-3 sm:p-4 w-full ${className}`}>
      {/* Avatar + Name + Time */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Avatar
            src={post.user?.avatar}
            alt={post.user?.name}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
          <div>
            <p className="font-semibold text-xs sm:text-sm md:text-base text-[var(--foreground)]">
              {post.user?.name}
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">
              {post.time}
            </p>
          </div>
        </div>
        <button className="text-[color:var(--muted-foreground)] text-xl">•••</button>
      </div>

      {/* Post content */}
      <p className="text-sm sm:text-base text-[var(--foreground)] mb-2">
        {post.content}
      </p>

      {/* Image grid */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="mt-2 w-full">
          {post.images.length <= 3 && (
            <div className="flex gap-1 rounded-lg overflow-hidden">
              {post.images.map((img, index) => (
                <div key={index} className="relative flex-1 aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    onClick={() => handleImageClick(index)}
                    className="object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {post.images.length === 4 && (
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              {post.images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    onClick={() => handleImageClick(index)}
                    className="object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {post.images.length > 4 && (
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              {post.images.slice(0, 4).map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    fill
                    onClick={() => handleImageClick(index)}
                    className="object-cover cursor-pointer"
                  />

                  {index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        +{post.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex mt-3 gap-4 text-[color:var(--muted-foreground)] text-base sm:text-lg">
        <button>
          <Heart className="h-5 w-5" />
        </button>
        <button>💬</button>
        <button>📤</button>
      </div>

      {/* Likes */}
      <p className="text-[color:var(--muted-foreground)] text-xs sm:text-sm mt-1">
        {post.likes} likes
      </p>

      {/* Latest comment */}
      {post.latestComment && (
        <div className="text-xs sm:text-sm mt-1">
          <span className="font-semibold">{post.latestComment.user}</span>
          <span className="ml-2">{post.latestComment.content}</span>
        </div>
      )}

      {/* View all comments */}
      <button className="text-[color:var(--muted-foreground)] mt-2 hover:underline text-xs sm:text-sm">
        View all {post.totalComments} comments
      </button>
    </Card>
  );
}
