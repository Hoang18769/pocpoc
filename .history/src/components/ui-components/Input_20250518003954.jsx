// components/ui/InputInlineLabel.jsx
"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function InputInlineLabel({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" && showPassword ? "text" : type

  return (
    <div className={`w-full border-b-2 border-[var(--border)] text-sm text-[var(--foreground)] relative flex items-center ${className}`}>
      <label className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none text-sm">
        {label}
      </label>
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        className="pl-16 pr-8 py-2 w-full bg-transparent outline-none"
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
  )
}
