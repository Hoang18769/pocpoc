// components/ui/Button.jsx

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
  type = "button",
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-blue-600 focus:bg-[var(--primary)]",
    ghost:
      "bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]",
    outline:
      "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card)]",
  };

  const combined = `${baseStyles} ${variants[variant] || ""} ${className}`;

  return (
    <button className={combined} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
