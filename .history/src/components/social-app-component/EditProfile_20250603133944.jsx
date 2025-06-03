"use client"
import { useState } from "react"
import Avatar from "../ui-components/Avatar"
import Input from "../ui-components/Input"

export default function EditProfileModal({ profileData, onSave }) {
  const [formData, setFormData] = useState({
    firstname: profileData.firstname,
    lastname: profileData.lastname,
    username: profileData.username,
    birthday: profileData.birthday,
    bio: profileData.bio,
    avatar: profileData.avatar
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className=" space-y-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="flex">

          <div className="flex flex-col items-center mb-4">
            <Avatar 
              src={formData.avatar} 
              className="w-20 h-20 mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          </div>
           
          

          {/* Save Button */}
          <button
            type="submit"
            className="w-full max-w-md px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-8"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}