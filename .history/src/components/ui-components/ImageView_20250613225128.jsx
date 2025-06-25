"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

const isVideo = (url) =>
  typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i);

export default function ImageView({ images = [], onImageClick }) {
  const [mutedVideos, setMutedVideos] = useState({});
  const videoRefs = useRef({});

  const toggleMute = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      const newMuted = !video.muted;
      video.muted = newMuted;
      setMutedVideos((prev) => ({ ...prev, [index]: newMuted }));
    }
  };

  const imageWrapperClass =
    "relative aspect-square rounded-lg overflow-hidden cursor-pointer";

  const renderMedia = (src, index) => {
    const isVid = isVideo(src);

    return (
      <div key={index} className={imageWrapperClass}>
        {isVid ? (
          <div className="relative w-full h-full">
            <video
              ref={(el) => {
                if (el) {
                  videoRefs.current[index] = el;

                  const observer = new IntersectionObserver(
                    ([entry]) => {
                      if (entry.isIntersecting) {
                        el.play().catch(() => {});
                      } else {
                        el.pause();
                      }
                    },
                    { threshold: 0.5 }
                  );

                  observer.observe(el);
                  el.__observer__ = observer;
                }
              }}
              src={src}
              className="object-cover w-full h-full rounded-lg cursor-pointer"
              loop
              muted={mutedVideos[index] ?? true}
              playsInline
              autoPlay
              onClick={() => onImageClick(index)}
            />

            <button
              onClick={() => toggleMute(index)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
            >
              {mutedVideos[index] ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
          </div>
        ) : (
          <Image
            src={src}
            alt={`Post media ${index + 1}`}
            fill
            unoptimized
            onClick={() => onImageClick(index)}
            className="object-cover"
          />
        )}
      </div>
    );
  };

  // Cleanup observers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video?.__observer__) {
          video.__observer__.disconnect();
          delete video.__observer__;
        }
      });
    };
  }, []);

  // Layout logic
  if (!Array.isArray(images) || images.length === 0) return null;
  if (images.length === 1)
    return <div className="mt-2">{renderMedia(images[0], 0)}</div>;
  if (images.length <= 3)
    return (
      <div className={`grid grid-cols-${images.length} gap-2 mt-2`}>
        {images.map((src, index) => renderMedia(src, index))}
      </div>
    );
  if (images.length === 4)
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.map((src, index) => renderMedia(src, index))}
      </div>
    );
  if (images.length >= 5)
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.slice(0, 3).map((src, index) => renderMedia(src, index))}
        <div className={`${imageWrapperClass} brightness-50`}>
          {renderMedia(images[3], 3)}
          <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg bg-black/40">
            +{images.length - 4}
          </span>
        </div>
      </div>
    );

  return null;
}
