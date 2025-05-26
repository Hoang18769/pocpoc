"use client"

import { useState } from "react"
import ThemeToggle from "@/components/ui-components/Themetoggle"
import { Eye, EyeOff } from "lucide-react"

export default function ComponentDemoPage() {
  // Danh sách các component để hiển thị
  const components = [
    { id: "user-header", name: "User Header", bgColor: "bg-blue-500" },
    { id: "post-card", name: "Post Card", bgColor: "bg-green-500" },
    { id: "comment-section", name: "Comment Section", bgColor: "bg-yellow-500" },
    { id: "user-list", name: "User List", bgColor: "bg-purple-500" },
    { id: "post-grid", name: "Post Grid", bgColor: "bg-pink-500" },
    { id: "navigation", name: "Navigation", bgColor: "bg-indigo-500" },
  ]

  // State để theo dõi trạng thái hiển thị của từng component
  const [visibleComponents, setVisibleComponents] = useState(
    components.reduce((acc, component) => {
      acc[component.id] = true
      return acc
    }, {}),
  )

  // Hàm toggle hiển thị component
  const toggleComponent = (id) => {
    setVisibleComponents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Component Demo</h1>
          <ThemeToggle />
        </div>

        <div className="space-y-6">
            <div
              key={component.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header với tên component và nút toggle */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-medium text-gray-900 dark:text-gray-100">{component.name}</h2>
                <button
                  onClick={() => toggleComponent(component.id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={visibleComponents[component.id] ? "Hide component" : "Show component"}
                  title={visibleComponents[component.id] ? "Hide component" : "Show component"}
                >
                  {visibleComponents[component.id] ? (
                    <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>

              {/* Component container */}
              {visibleComponents[component.id] && (
                <div className="p-4">
                  {/* Placeholder component - Thay thế bằng component thực tế của bạn */}
                  <div
                    className={`${component.bgColor} w-full h-32 rounded-lg flex items-center justify-center text-white font-medium`}
                  >
                    Thay thế bằng component {component.name}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}
