import Image from "next/image"
import clsx from "clsx"

export default function Avatar({
  src,
  alt = "User avatar",
  size = 80,
  variant = "default",
  className = "",
  ...props
}) {
  const isString = typeof src === "string"
  const actualSrc = isString ? src : src?.src || "/placeholder.svg"

  const borderWeight = variant === "story" ? 3 : 1
  const innerSize = size - borderWeight * 2

  const wrapperClass = clsx(
    "relative rounded-full flex items-center justify-center",
    variant === "story"
      ? "p-[3px] bg-gradient-to-b from-[#b62977] to-[#ed8128]"
      : "p-[1px] bg-[#efefef]",
    className
  )

  return (
    <div className={wrapperClass} style={{ width: size, height: size }}>
      <div className="rounded-full overflow-hidden w-full h-full">
        <Image
          src={actualSrc}
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
