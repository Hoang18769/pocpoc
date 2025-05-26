import Image from "next/image"

export default function Avatar({ src, alt, size = 80, variant = "default", className = "" }) {
  const borderWeight = variant === "story" ? 3 : 1
  const innerSize = size - borderWeight * 2

  const wrapperClass =
    "relative rounded-full flex items-center justify-center " +
    (variant === "story"
      ? "p-[3px] bg-gradient-to-b from-[#b62977] to-[#ed8128]"
      : "p-[1px] bg-[#efefef]") +
    ` ${className}`

  return (
    <div className={wrapperClass} style={{ width: size, height: size }}>
      <div className="rounded-full overflow-hidden w-full h-full">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={innerSize}
          height={innerSize}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
