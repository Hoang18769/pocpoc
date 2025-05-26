"use client";

import React from "react";
import clsx from "clsx";

export default function Switch({ checked = false, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-[var(--primary)]" : "bg-[var(--border)]"
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
