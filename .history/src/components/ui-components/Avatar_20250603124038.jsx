import defaultAvatar from "@/assests/photo/AfroAvatar.png"
import Image from "next/image"

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 80,
}


export default function Avatar({
  src,
  alt = "User avatar",
  size = 80, // string ("md") hoặc number (40)
  className = "",
  ...props
}) {
  const numericSize = typeof size === "string" ? sizeMap[size] || 40 : size
  const borderWeight = variant === "story" ? 3 : 1
  const innerSize = numericSize - borderWeight * 2



  const finalSrc = !src
    ? defaultAvatar
    : typeof src === "string"
    ? src
    : src?.src || defaultAvatar

  return (
    <div style={{ width: numericSize, height: numericSize }}>
      <div className="rounded-full overflow-hidden w-full h-full">
        <Image
          src={finalSrc}
          alt={alt}
          width={innerSize}
          height={innerSize}
          className="w-full h-full object-cover"
          {...props}
        />
      </div>
    </div>
  )
}
