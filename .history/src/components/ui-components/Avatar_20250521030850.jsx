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
          src={src || "/placeholder.svg"}
          alt={alt}
          width={innerSize}
