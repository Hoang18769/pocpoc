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
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          {/* Avatar */}
          

          {/* First Name */}
          <Input
            label="First Name"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            className="w-full max-w-md"
          />

          {/* Last Name */}
          <Input
            label="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            className="w-full max-w-md"
          />

          {/* Username */}
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full max-w-md"
          />

          {/* Birthday */}
          <Input
            label="Birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            placeholder="DD/MM/YYYY"
            className="w-full max-w-md"
          />

          {/* Bio */}
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border-b-2 border-[var(--border)] bg-transparent outline-none resize-none text-[var(--foreground)]"
              placeholder="Tell us about yourself..."
            />
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