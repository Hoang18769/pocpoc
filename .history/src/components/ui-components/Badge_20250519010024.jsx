const variants = {
  primary: "bg-blue-500 text-white",
  secondary: "bg-gray-300 text-gray-800",
  success: "bg-green-500 text-white",
  warning: "bg-yellow-400 text-black",
};

export default function Badge({ children, variant = "primary", className = "" }) {
  return (
    <span
      className={clsx(
        "block tracking-wide font-semibold text-xs sm:text-sm md:text-base px-2 py-1 rounded",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
