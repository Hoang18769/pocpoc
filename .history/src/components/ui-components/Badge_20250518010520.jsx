"use client";

import React from "react";
import clsx from "clsx";

export default function Badge({ children, variant = "default", className = "" }) {
  const baseClass = "inline-block rounded-full font-semibold transition-colors";
  const sizeClass = "px-3 py-1 text-xs sm:text-sm md:text-base";
  
  const variantClass = {
    default: "bg-[var(--border)] text-[var(--foreground)]",
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    outline: "border border-[var(--border)] text-[var(--foreground)] bg-transparent",
  };

  return (
    <span className={clsx(baseClass, sizeClass, variantClass[variant], className)}>
      {children}
    </span>
  );
}
