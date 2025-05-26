import clsx from "clsx";

export default function Card({ children, className = "", elevation = 1, style }) {
  const shadows = {
    0: "shadow-none",
    1: "shadow-md",
    2: "shadow-lg",
    3: "shadow-xl",
  };

  return (
    <div
      className={clsx(
        "bg-[var(--card)] rounded-lg p-4 inline-block", // inline-block để width theo nội dung
        shadows[elevation] || shadows[1],
        className
      )}
      style={{
        minWidth: 200,
        minHeight:200,  // kích thước tối thiểu (bạn có thể điều chỉnh)
        ...style,
      }}
    >
      {children}
    </div>
  );
}
