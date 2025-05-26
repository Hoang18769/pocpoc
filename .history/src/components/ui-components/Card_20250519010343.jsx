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
      className={clsx("bg-white rounded-lg p-4", shadows[elevation] || shadows[1], className)}
      style={style}
    >
      {children}
    </div>
  );
}
