import avt from "@/assests/photo/AfroAvatar.png"

import Image from "next/image";
const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 80,
}
const variantStyles = {
  story: "p-[3px] bg-gradient-to-b from-[#b62977] to-[#ed8128]",
  default: "p-[1px] bg-[#]",
}

export default function Avatar({
  src,
  alt = "User avatar",
  size = 80, // có thể là string hoặc số
  variant = "default",
  className = "",
  ...props
}) {
  const numericSize = typeof size === "string" ? sizeMap[size] || 40 : size
  const borderWeight = variant === "story" ? 3 : 1
  const innerSize = numericSize - borderWeight * 2

  const wrapperClass = `relative rounded-full flex items-center justify-center ${
    variantStyles[variant] || variantStyles.default
  } ${className}`

  return (
    <div className={wrapperClass} style={{ width: numericSize, height: numericSize }}>
      <div className="rounded-full overflow-hidden w-full h-full">
        <Image
          src={src || avt}
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
