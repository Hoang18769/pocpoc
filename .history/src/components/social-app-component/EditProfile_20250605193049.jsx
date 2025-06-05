"use client"
import { useState } from "react"
import Avatar from "../ui-components/Avatar"
import Input from "../ui-components/Input"
import api from "@/utils/axios"
import axios from "axios"
export default function EditProfileModal({ profileData, onSave }) {
  const [formData, setFormData] = useState({
    firstname: profileData.givenName || "",
    lastname: profileData.familyName || "",
    username: profileData.username || "",
    birthday: profileData.birthdate || "",
    bio: profileData.bio || "",
    avatar: profileData.profilePictureUrl || "/avatar-placeholder.png"
  })
  const token=localStorage.getItem("accessToken")
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessages, setSuccessMessages] = useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target.result }))
        setAvatarFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccessMessages([])

    const updates = [
      {
        label: "Name",
        check: formData.firstname !== profileData.givenName || formData.lastname !== profileData.familyName,
        request: () =>
          api.patch(`/v1/users/update-name?givenName=${encodeURIComponent(formData.firstname)}&familyName=${encodeURIComponent(formData.lastname)}`),
        errorKey: "name",
      },
      {
        label: "Username",
        check: formData.username !== profileData.username,
        request: () =>
          api.patch(`/v1/users/update-username?username=${encodeURIComponent(formData.username)}`),
        errorKey: "username",
      },
      {
  label: "Bio",
  check: formData.bio !== profileData.bio,
  request: () =>
    api.patch(
      `/v1/users/update-bio?bio=${encodeURIComponent(formData.bio)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ),
  errorKey: "bio",
},

      { 
        label: "Avatar",
        check: !!avatarFile,
        request: () => {
          const form = new FormData()
          form.append("file", avatarFile)
          return api.patch("/v1/users/update-profile-picture", form, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        },
        errorKey: "avatar",
      },
    ]

    let successCount = 0

    for (const item of updates) {
      if (item.check) {
        try {
          await item.request()
          setSuccessMessages(prev => [...prev, `${item.label} updated successfully`])
          successCount++
        } catch (err) {
          console.log(err)
          setErrors(prev => ({
            ...prev,
            [item.errorKey]: err.response?.data?.message || `Failed to update ${item.label.toLowerCase()}`,
          }))
        }
      }
    }

    if (successCount > 0) {
      onSave({
        ...formData,
        givenName: formData.firstname,
        familyName: formData.lastname,
        profilePictureUrl: formData.avatar
      })
    }

    setLoading(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </div>

      {successMessages.length > 0 && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <ul className="text-sm text-green-700">
            {successMessages.map((msg, index) => (
              <li key={index}>✅ {msg}</li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <ul className="text-sm text-red-700">
            {Object.entries(errors).map(([field, error]) =>
              error ? <li key={field}>❌ {error}</li> : null
            )}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          <div className="flex flex-col items-center">
            <Avatar src={formData.avatar} className="w-24 h-24 mb-2" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
          </div>

          <div className="w-full max-w-md space-y-4">
            <div>
              <Input name="firstname" label="First Name" value={formData.firstname} onChange={handleInputChange} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Input name="lastname" label="Last Name" value={formData.lastname} onChange={handleInputChange} />
            </div>
            <div>
              <Input name="username" label="Username" value={formData.username} onChange={handleInputChange} />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <Input name="birthday" label="Birthday" value={formData.birthday} onChange={handleInputChange} placeholder="DD/MM/YYYY" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border-b-2 border-[var(--border)] bg-transparent outline-none resize-none text-[var(--foreground)]"
                placeholder="Tell us about yourself..."
              />
              {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
