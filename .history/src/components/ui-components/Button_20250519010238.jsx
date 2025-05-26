import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent-foreground)] focus:bg-[var(--primary)]",
    ghost:
      "bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]",
    outline:
      "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card)]",
  };

  const combined = clsx(baseStyles, variants[variant], className);

  return (
    <button
      className={combined}
      onClick={onClick}
      disabled={disabled}
      type={type}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
