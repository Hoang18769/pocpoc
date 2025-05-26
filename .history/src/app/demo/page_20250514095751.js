"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import PostCard from "@/components/social-app-component/Postcard"
export default function SimpleTogglePage() {
  // Danh sách các component để hiển thị
  const components = [
    { id: "component-1", name: "Component 1", com:"<PostCard"  },
    { id: "component-2", name: "Component 2",  },
    { id: "component-3", name: "Component 3",  },
    { id: "component-4", name: "Component 4",  },
    { id: "component-5", name: "Component 5", },
    { id: "component-6", name: "Component 6",  },
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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Component Toggle</h1>

      <div className="space-y-6">
        {components.map((component) => (
          <div key={component.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900 dark:text-gray-100">{component.name}</h2>
              <button
                onClick={() => toggleComponent(component.id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {visibleComponents[component.id] ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>

            {visibleComponents[component.id] && <div className={`${component.bgColor} w-full h-32 rounded-lg`}></div>}
          </div>
        ))}
      </div>
    </div>
  )
}
