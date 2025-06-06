"use client"

import Image from "next/image"

export default function ImageView({ images = [], onImageClick }) {
  if (!Array.isArray(images) || images.length === 0) return null

  const getSrc = (img) => (typeof img === "string" ? img : img?.src || "")

  if (images.length === 1) {
    return (
      <div className="relative aspect-square rounded-lg overflow-hidden mt-2">
        <Image
          src={getSrc(images[0])}
          alt="Post image"
          width={500}
          height={500}
          className="object-cover cursor-pointer w-full h-full"
          onClick={() => onImageClick(0)}
        />
      </div>
    )
  }

  if (images.length === 2 || images.length === 3) {
    return (
      <div className={`grid gap-1 rounded-lg overflow-hidden mt-2 ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={getSrc(img)}
              alt={`Post image ${index + 1}`}
              fill
              onClick={() => onImageClick(index)}
              className="object-cover cursor-pointer"
            />
          </div>
        ))}
      </div>
    )
  }

  if (images.length === 4) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden mt-2">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={getSrc(img)}
              alt={`Post image ${index + 1}`}
              fill
              onClick={() => onImageClick(index)}
              className="object-cover cursor-pointer"
            />
          </div>
        ))}
      </div>
    )
  }

  if (images.length >= 5) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden mt-2">
        {images.slice(0, 3).map((img, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={getSrc(img)}
              alt={`Post image ${index + 1}`}
              fill
              onClick={() => onImageClick(index)}
              className="object-cover cursor-pointer"
            />
          </div>
        ))}
        <div className="relative aspect-square col-span-1">
          <Image
            src={getSrc(images[3])}
            alt="Post image 4"
            fill
            onClick={() => onImageClick(3)}
            className="object-cover cursor-pointer brightness-50"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg">
            +{images.length - 4}
          </span>
        </div>
      </div>
    )
  }

  return null
}
