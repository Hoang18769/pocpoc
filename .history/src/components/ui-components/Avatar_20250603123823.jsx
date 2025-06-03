import defaultAvatar from "@/assests/photo/AfroAvatar.png"
import Image from "next/image"

export default function Avatar({
  src,
  alt = "User avatar",
  width = 80,
  height = 64,
  className = "",
  ...props
}) {
  const finalSrc = src || defaultAvatar

  return (
    <div className={`relative rounded-full overflow-hidden w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 ${className}`}>
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        {...props}
      />
    </div>
  )
}