"use client"
import { useState } from "react"
import Avatar from "../ui-components/Avatar"
import Input from "../ui-components/Input"
import api from "@/utils/axios"

export default function EditProfileModal({ profileData, onSave }) {
  const [formData, setFormData] = useState({
    firstname: profileData.givenName || "",
    lastname: profileData.familyName || "",
    username: profileData.username || "",
    birthday: profileData.birthday || "",
    bio: profileData.bio || "",
    avatar: profileData.profilePictureUrl || "/avatar-placeholder.png"
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessages, setSuccessMessages] = useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error khi user bắt đầu sửa
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, avatar: e.target.result }))
        setAvatarFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const showError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }

  const addSuccessMessage = (message) => {
    setSuccessMessages(prev => [...prev, message])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccessMessages([])

    console.log("🚀 Bắt đầu update profile với data:", formData)
    console.log("📋 Profile data hiện tại:", profileData)

    try {
      // 1. Update name
      if (
        formData.firstname !== profileData.givenName ||
        formData.lastname !== profileData.familyName
      ) {
        console.log("🔄 Updating name...", {
          old: { givenName: profileData.givenName, familyName: profileData.familyName },
          new: { givenName: formData.firstname, familyName: formData.lastname }
        })
        
        try {
          const nameResponse = await api.patch(
            `/v1/users/update-name?givenName=${encodeURIComponent(formData.firstname)}&familyName=${encodeURIComponent(formData.lastname)}`
          )
          console.log("✅ Name update response:", nameResponse.data)
          addSuccessMessage("Name updated successfully")
        } catch (err) {
          console.error("❌ Failed to update name:", err)
          console.error("Response data:", err.response?.data)
          console.error("Status:", err.response?.status)
          showError("name", err.response?.data?.message || "Failed to update name")
        }
      }

      // 2. Update username
      if (formData.username !== profileData.username) {
        console.log("🔄 Updating username...", {
          old: profileData.username,
          new: formData.username
        })
        
        try {
          const usernameResponse = await api.patch(`/v1/users/update-username?username=${encodeURIComponent(formData.username)}`)
          console.log("✅ Username update response:", usernameResponse.data)
          addSuccessMessage("Username updated successfully")
        } catch (err) {
          console.error("❌ Failed to update username:", err)
          console.error("Response data:", err.response?.data)
          showError("username", err.response?.data?.message || "Failed to update username")
        }
      }

      // 3. Update birthday
      // if (formData.birthday !== profileData.birthday) {
      //   console.log("🔄 Updating birthday...", {
      //     old: profileData.birthday,
      //     new: formData.birthday
      //   })
        
      //   try {
      //     const birthdayResponse = await api.patch(`/v1/users/update-birthdate?birthdate=${encodeURIComponent(formData.birthday)}`)
      //     console.log("✅ Birthday update response:", birthdayResponse.data)
      //     addSuccessMessage("Birthday updated successfully")
      //   } catch (err) {
      //     console.error("❌ Failed to update birthday:", err)
      //     console.error("Response data:", err.response?.data)
      //     showError("birthday", err.response?.data?.message || "Failed to update birthday")
      //   }
      // }

      // 4. Update bio
      if (formData.bio !== profileData.bio) {
        console.log("🔄 Updating bio...", {
          old: profileData.bio,
          new: formData.bio
        })
        
        try {
          const bioResponse = await api.patch(`/v1/users/update-bio?bio=${encodeURIComponent(formData.bio)}`)
          console.log("✅ Bio update response:", bioResponse.data)
          addSuccessMessage("Bio updated successfully")
        } catch (err) {
          console.error("❌ Failed to update bio:", err)
          console.error("Response data:", err.response?.data)
          showError("bio", err.response?.data?.message || "Failed to update bio")
        }
      }

      // 5. Update avatar
      if (avatarFile) {
        console.log("🔄 Updating avatar...", avatarFile)
        
        try {
          const form = new FormData()
          form.append("file", avatarFile)
          const avatarResponse = await api.patch("/v1/users/update-profile-picture", form, {
            headers: {
              'Content-Type': 'multipart/form-data',  
            }
          })
          console.log("✅ Avatar update response:", avatarResponse.data)
          addSuccessMessage("Avatar updated successfully")
        } catch (err) {
          console.error("❌ Failed to update avatar:", err)
          console.error("Response data:", err.response?.data)
          showError("avatar", err.response?.data?.message || "Failed to update avatar")
        }
      }

      // Nếu có ít nhất 1 update thành công
      if (successMessages.length > 0) {
        console.log("🎉 Update completed with successes:", successMessages)
        onSave(formData) // Callback để cập nhật UI
      }

    } catch (err) {
      console.error("❌ Unexpected error:", err)
      showError("general", "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </div>

      {/* Success Messages */}
      {successMessages.length > 0 && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <ul className="text-sm text-green-700">
            {successMessages.map((msg, index) => (
              <li key={index}>✅ {msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <ul className="text-sm text-red-700">
            {Object.entries(errors).map(([field, error]) => (
              error && <li key={field}>❌ {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          {/* Avatar + Upload */}
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

          {/* Form Fields */}
          <div className="w-full max-w-md space-y-4">
            <div>
              <Input 
                label="First Name" 
                name="firstname" 
                value={formData.firstname} 
                onChange={handleInputChange} 
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Input 
                label="Last Name" 
                name="lastname" 
                value={formData.lastname} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div>
              <Input 
                label="Username" 
                name="username" 
                value={formData.username} 
                onChange={handleInputChange} 
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            
            <div>
              <Input 
                label="Birthday" 
                name="birthday" 
                value={formData.birthday} 
                onChange={handleInputChange} 
                placeholder="DD/MM/YYYY" 
              />
              {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>}
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

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}