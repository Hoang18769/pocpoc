"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

// Import các component thực tế
import PostCard from "@/components/social-app-component/Postcard"
import UserHeader from "@/components/social-app-component/UserHeader"
// Import thêm các component khác nếu cần

// Tạo mapping giữa tên component và component thực tế
const ComponentMap = {
  PostCard: PostCard,
  UserHeader: UserHeader,
  // Thêm các component khác vào đây
}

// Dữ liệu mẫu cho các component
const sampleData = {
   post = {
  user: {
    name: "Nguyễn Văn A",
    avatar: "/assets/photo/avatar1.png",
  },
  time: "57 minutes ago",
  content: "Lorem ipsum dolor sit amet. Hic neque vitae sit vero explicabo...",
  image: "/assets/photo/post-img.jpg",
  likes: "32.8k",
  latestComment: {
    user: "name",
    content: "Lorem ipsum dolor sit amet.",
  },
  totalComments: 39,
},
  UserHeader: {
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      lastOnline: "5 minutes ago",
    },
    variant: "post",
    lastonline: true,
    isme: false,
  },
  // Thêm dữ liệu mẫu cho các component khác
}

// Component để render component động
const DynamicComponent = ({ componentName }) => {
  // Lấy component từ mapping
  const Component = ComponentMap[componentName]

  // Nếu không tìm thấy component, hiển thị thông báo lỗi
  if (!Component) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
        Component {componentName} không tồn tại
      </div>
    )
  }

  // Lấy dữ liệu mẫu cho component
  const props = sampleData[componentName] || {}

  // Render component với props
  return <Component {...props} />
}

export default function DynamicComponentsPage() {
  // Danh sách các component để hiển thị
  const components = [
    { id: "component-1", name: "Post Card", com: "PostCard" },
    { id: "component-2", name: "User Header", com: "UserHeader" },
    { id: "component-3", name: "Component Không Tồn Tại", com: "NonExistentComponent" },
    // Thêm các component khác vào đây
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
      <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dynamic Components</h1>

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

            {visibleComponents[component.id] && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <DynamicComponent componentName={component.com} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
