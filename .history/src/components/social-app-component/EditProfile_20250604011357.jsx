"use client"
import { useState } from "react"
import Avatar from "../ui-components/Avatar"
import Input from "../ui-components/Input"

export default function EditProfileModal({ profileData, onSave }) {
  const [formData, setFormData] = useState({
    firstname: profileData.firstname || "",
    lastname: profileData.lastname || "",
    username: profileData.username || "",
    birthday: profileData.birthday || "",
    bio: profileData.bio || "",
    avatar: profileData.avatar || ""
  })

  const [logs, setLogs] = useState([])

  const logResult = (message) => {
    setLogs((prev) => [...prev, message])
    console.log(message)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLogs([]) // Reset logs mỗi lần nhấn Save
    const tasks = []

    // Update name
    if (
      formData.firstname !== profileData.firstname ||
      formData.lastname !== profileData.lastname
    ) {
      tasks.push(
        fetch("/v1/users/update-name", {
          method: "PATCH",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            givenName: formData.firstname,
            familyName: formData.lastname,
          }),
        })
          .then((res) =>
            res.ok
              ? logResult("✅ Updated name successfully")
              : logResult("❌ Failed to update name")
          )
          .catch(() => logResult("❌ Error updating name"))
      )
    }

    // Update username
    if (formData.username !== profileData.username) {
      tasks.push(
        fetch("/v1/users/update-username", {
          method: "PATCH",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username: formData.username }),
        })
          .then((res) =>
            res.ok
              ? logResult("✅ Updated username successfully")
              : logResult("❌ Failed to update username")
          )
          .catch(() => logResult("❌ Error updating username"))
      )
    }

    // Update birthday
    if (formData.birthday !== profileData.birthday) {
      tasks.push(
        fetch("/v1/users/update-birthdate", {
          method: "PATCH",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ birthdate: formData.birthday }),
        })
          .then((res) =>
            res.ok
              ? logResult("✅ Updated birthday successfully")
              : logResult("❌ Failed to update birthday")
          )
          .catch(() => logResult("❌ Error updating birthday"))
      )
    }

    // Update bio
    if (formData.bio !== profileData.bio) {
      tasks.push(
        fetch("/v1/users/update-bio", {
          method: "PATCH",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ bio: formData.bio }),
        })
          .then((res) =>
            res.ok
              ? logResult("✅ Updated bio successfully")
              : logResult("❌ Failed to update bio")
          )
          .catch(() => logResult("❌ Error updating bio"))
      )
    }

    // Update avatar
    if (formData.avatarFile) {
      const formDataImage = new FormData()
      formDataImage.append("file", formData.avatarFile)

      tasks.push(
        fetch("/v1/users/update-profile-picture", {
          method: "PATCH",
          body: formDataImage,
        })
          .then((res) =>
            res.ok
              ? logResult("✅ Updated profile picture successfully")
              : logResult("❌ Failed to update profile picture")
          )
          .catch(() => logResult("❌ Error updating profile picture"))
      )
    }

    try {
      await Promise.all(tasks)
      onSave(formData)
    } catch (error) {
      logResult("❌ Some updates failed")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          avatar: e.target.result,
          avatarFile: file,
        }))
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
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col justify-between p-6 overflow-y-auto"
      >
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
          </div>

          {/* Form Fields */}
          <div className="w-full max-w-md space-y-4">
            <Input
              label="First Name"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
            />

            <Input
              label="Last Name"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
            />

            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />

            <Input
              label="Birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
            />

            <div>
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
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col items-center gap-2 mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>

          {/* Log Hiển thị */}
          <div className="text-sm text-gray-600 space-y-1">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
