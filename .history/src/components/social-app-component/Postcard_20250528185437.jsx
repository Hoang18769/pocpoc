"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Avatar from "../ui-components/Avatar";
import Card from "../ui-components/Card";
import { Heart } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../ui-components/Modal";
export default function PostCard({ post, size = "default", className = "" }) {
  const [isMobile, setIsMobile] = useState(undefined);
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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isMobile === undefined) return null;

  const getAvatarSize = () => {
    return isMobile
      ? size === "compact"
        ? 28
        : size === "large"
        ? 36
        : 32
      : size === "compact"
      ? 32
      : size === "large"
      ? 48
      : 40;
  };

  const getTextSizes = () => ({
    username:
      size === "compact"
        ? "text-xs sm:text-sm"
        : size === "large"
        ? "text-sm sm:text-base"
        : "text-sm",
    time:
      size === "compact"
        ? "text-[10px] sm:text-xs"
        : size === "large"
        ? "text-xs"
        : "text-xs",
    content:
      size === "compact"
        ? "text-xs sm:text-sm"
        : size === "large"
        ? "text-sm sm:text-base"
        : "text-sm",
    actions:
      size === "compact"
        ? "text-sm"
        : size === "large"
        ? "text-xl"
        : "text-base",
    likes:
      size === "compact"
        ? "text-[10px]"
        : size === "large"
        ? "text-sm"
        : "text-xs",
    comments:
      size === "compact"
        ? "text-[10px] sm:text-xs"
        : size === "large"
        ? "text-sm"
        : "text-xs",
    viewAll:
      size === "compact"
        ? "text-[10px]"
        : size === "large"
        ? "text-sm"
        : "text-xs",
    spacing:
      size === "compact"
        ? "gap-2 mb-1"
        : size === "large"
        ? "gap-4 mb-3"
        : "gap-3 mb-2",
  });

  const textSizes = getTextSizes();
  const padding =
    size === "compact"
      ? "p-2 sm:p-3"
      : size === "large"
      ? "p-5 sm:p-6"
      : "p-3 sm:p-4";

  return (
    <div>
      
    </div>
    
  );
}
