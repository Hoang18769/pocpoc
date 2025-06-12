"use client"
import Image from "next/image"

const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url)

export default function ImageView({ images = [], onImageClick }) {
  if (!Array.isArray(images) || images.length === 0) return null

  const imageWrapperClass =
    "relative aspect-square rounded-lg overflow-hidden cursor-pointer"

  const renderMedia = (src, index) => {
    if (isVideo(src)) {
      return (
        <video src="http://localhost/v1/files/eab51fdf-1970-4276-9275-4e3d3d0ae9e0.mp4" controls className="w-full" />

        <video
          key={index}
          src={src}
          className="w-full h-full object-cover rounded-lg"
          muted
          loop
          playsInline
          onClick={() => onImageClick(index)}
        />
      )
    } else {
      return (
        <Image
          key={index}
          src={src}
          alt={`Post media ${index + 1}`}
          width={500}
          height={500}
          onClick={() => onImageClick(index)}
          className="w-full h-full object-cover rounded-lg"
          unoptimized
        />
      )
    }
  }

  const renderGrid = (items) => (
    <div className={`grid grid-cols-${items.length} gap-2 mt-2`}>
      {items.map((src, index) => (
        <div key={index} className={imageWrapperClass}>
          {renderMedia(src, index)}
        </div>
      ))}
    </div>
  )

  if (images.length === 1) {
    return (
      <div className={`${imageWrapperClass} mt-2`}>
        {renderMedia(images[0], 0)}
      </div>
    )
  }

  if (images.length <= 3) return renderGrid(images)

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

  if (images.length >= 5) {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.slice(0, 3).map((src, index) => (
          <div key={index} className={imageWrapperClass}>
            {renderMedia(src, index)}
          </div>
        ))}
        <div className={`${imageWrapperClass} relative`}>
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
