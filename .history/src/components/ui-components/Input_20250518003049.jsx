// components/ui/Input.jsx
"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function Input({
  label,
  type = "text",
  field = false,
  value,
  onChange,
  name,
  placeholder,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" && showPassword ? "text" : type

  const baseClass = field
    ? "w-full border-0 border-b-2 border-[var(--border)] bg-transparent text-sm text-[var(--foreground)] placeholder-gray-400 outline-none focus:border-[var(--primary)]"
    : "w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-400 outline-none focus:ring-2 focus:ring-[var(--primary)]"

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="text-sm font-medium mb-1 block">{label}</label>}
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          name={name}
          placeholder={placeholder}
          className={baseClass + (field ? " py-1 px-0" : "")}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}