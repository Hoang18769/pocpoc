"use client"
import Image from "next/image"

export default function ImageView({ images = [], onImageClick }) {
  console.log(images)
  if (!Array.isArray(images) || images.length === 0) return null
console.log("images", images)

  if (images.length === 1) {
    return (
      <div className="border relative aspect-square rounded-lg overflow-hidden mt-2">

        <Image
          src={images[0]}
          alt="Post image"
          width={100}
          height={100}
          onClick={() => onImageClick(0)}
          className="object-cover cursor-pointer"
        />
      </div>
    )
  }

  if (images.length <= 3) {
    return (
      <div className={`grid grid-cols-${images.length} gap-1 rounded-lg overflow-hidden mt-2`}>
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={img}
              alt={`Post image ${index + 1}`}
              width={100}
              height={100}
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
              src={img}
              alt={`Post image ${index + 1}`}
              width={100}
              height={100}
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
              src={img}
              alt={`Post image ${index + 1}`}
              width={100}
              height={100}
              onClick={() => onImageClick(index)}
              className="object-cover cursor-pointer"
            />
          </div>
        ))}
        <div className="relative aspect-square col-span-1">
          <Image
            src={images[3]}
            alt="Post image 4"
            width={100}
            height={100}
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
