"use client"
import Image from "next/image"
import { useMemo } from "react"

function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessoken")
}

function appendToken(url) {
  const token = getAccessToken()
  if (!token) return url

  // chỉ thêm token nếu chưa có query string
  if (url.includes("?")) {
    return `${url}&token=${token}`
  }
  return `${url}?token=${token}`
}

export default function ImageView({ images = [], onImageClick }) {
  if (!Array.isArray(images) || images.length === 0) return null

  // ✅ Memo hóa để tránh tính lại mỗi lần render
  const imagesWithToken = useMemo(() => {
    return images.map((url) => appendToken(url))
  }, [images])

  const imageWrapperClass = "relative aspect-square rounded-lg overflow-hidden cursor-pointer"

  if (imagesWithToken.length === 1) {
    return (
      <div className={`${imageWrapperClass} mt-2`}>
        <Image
          src={imagesWithToken[0]}
          alt="Post image"
          fill
          unoptimized
          onClick={() => onImageClick(0)}
          className="object-cover"
        />
      </div>
    )
  }

  if (imagesWithToken.length <= 3) {
    return (
      <div className={`grid grid-cols-${imagesWithToken.length} gap-2 mt-2`}>
        {imagesWithToken.map((img, index) => (
          <div key={index} className={imageWrapperClass}>
            <Image
              src={img}
              alt={`Post image ${index + 1}`}
              fill
              unoptimized
              onClick={() => onImageClick(index)}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    )
  }

  if (imagesWithToken.length === 4) {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {imagesWithToken.map((img, index) => (
          <div key={index} className={imageWrapperClass}>
            <Image
              src={img}
              alt={`Post image ${index + 1}`}
              fill
              unoptimized
              onClick={() => onImageClick(index)}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    )
  }

  if (imagesWithToken.length >= 5) {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {imagesWithToken.slice(0, 3).map((img, index) => (
          <div key={index} className={imageWrapperClass}>
            <Image
              src={img}
              alt={`Post image ${index + 1}`}
              fill
              unoptimized
              onClick={() => onImageClick(index)}
              className="object-cover"
            />
          </div>
        ))}
        <div className={`${imageWrapperClass} brightness-50`}>
          <Image
            src={imagesWithToken[3]}
            alt="Post image 4"
            fill
            unoptimized
            onClick={() => onImageClick(3)}
            className="object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg">
            +{imagesWithToken.length - 4}
          </span>
        </div>
      </div>
    )
  }

  return null
}
