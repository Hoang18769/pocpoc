import Image from "next/image";

const variantStyles = {
  story: "p-[3px] bg-gradient-to-b from-[#b62977] to-[#ed8128]",
  default: "p-[1px] bg-[#efefef]",
};

export default function Avatar({
  src,
  alt = "User avatar",
  size = 80,
  variant = "default",
  className = "",
  ...props
}) {
  const borderWeight = variant === "story" ? 3 : 1;
  const innerSize = size - borderWeight * 2;
  const wrapperClass = `relative rounded-full flex items-center justify-center ${
    variantStyles[variant] || variantStyles.default
  } ${className}`;

  // ✅ Đảm bảo src hợp lệ (object hoặc string)
  const imageSrc = typeof src === "string" ? src : src?.src || "/placeholder.svg";

  return (
    <div className={wrapperClass} style={{ width: size, height: size }}>
      <div className="rounded-full overflow-hidden w-full h-full">
        <Image
          src={imageSrc}
          alt={alt}
          width={innerSize}
          height={innerSize}
          className="w-full h-full object-cover"
          {...props}
        />
      </div>
    </div>
  );
}
