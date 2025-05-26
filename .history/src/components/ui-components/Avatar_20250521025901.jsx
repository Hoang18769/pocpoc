import Image from "next/image"
import clsx from "clsx"

const variantStyles = {
  story: "p-[3px] bg-gradient-to-b from-[#b62977] to-[#ed8128]",
  default: "p-[1px] bg-[#efefef]",
}

// Ánh xạ size chữ → số pixel
const sizeMap = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 80,
  xl: 96,
}

export default function Avatar({
  src,
  alt = "User avatar",
  size = "lg", // mặc định là "lg"
  variant = "default",
  className = "",
  ...props // truyền thêm props cho Image
}) {
  const numericSize = typeof size === "string" ? sizeMap[size] || 80 : size
  const borderWeight = variant === "story" ? 3 : 1
  const innerSize = numericSize - borderWeight * 2

  const wrapperClass = clsx(
    "relative rounded-full flex items-center justify-center",
    variantStyles[variant] || variantStyles.default,
    className
  )

  return (
    <div className={wrapperClass} style={{ width: numericSize, height: numericSize }}>
      <div className="rounded-full overflow-hidden w-full h-full">
        <Image
          src={src || "/placeholder.svg"}
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
