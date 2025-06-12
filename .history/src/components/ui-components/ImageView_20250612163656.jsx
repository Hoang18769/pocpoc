"use client"
import Image from "next/image"

const isVideo = (url) => {
  return typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i)
}

export default function ImageView({ images = [], onImageClick }) {
  if (!Array.isArray(images) || images.length === 0) return null

  const imageWrapperClass =
    "relative aspect-square rounded-lg overflow-hidden cursor-pointer"
console.log
  const renderMedia = (src, index) => {
    return isVideo(src) ? (
      <video
        key={index}
        src={src}
        onClick={() => onImageClick(index)}
        className="object-cover w-full h-full"
        muted
        loop
        playsInline
      />
    ) : (
      <Image
        key={index}
        src={src}
        alt={`Post media ${index + 1}`}
        fill
        unoptimized
        onClick={() => onImageClick(index)}
        className="object-cover"
      />
    )
  }

  if (images.length === 1) {
    return (
      <div className={`${imageWrapperClass} mt-2`}>
        {renderMedia(images[0], 0)}
      </div>
    )
  }

  if (images.length <= 3) {
    return (
      <div className={`grid grid-cols-${images.length} gap-2 mt-2`}>
        {images.map((src, index) => (
          <div key={index} className={imageWrapperClass}>
            {renderMedia(src, index)}
          </div>
        ))}
      </div>
    )
  }

  if (images.length === 4) {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.map((src, index) => (
          <div key={index} className={imageWrapperClass}>
            {renderMedia(src, index)}
          </div>
        ))}
      </div>
    )
  }

  // Hiển thị 4 item, và thêm dấu +n nếu > 4
  if (images.length >= 5) {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.slice(0, 3).map((src, index) => (
          <div key={index} className={imageWrapperClass}>
            {renderMedia(src, index)}
          </div>
        ))}
        <div className={`${imageWrapperClass} brightness-50`}>
          {renderMedia(images[3], 3)}
          <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg bg-black/40">
            +{images.length - 4}
          </span>
        </div>
      </div>
    )
  }

  return null
}
