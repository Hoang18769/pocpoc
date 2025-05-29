"use client"

import { useState } from "react"
import Input from "@/components/ui-components/Input"
import Button from "@/components/ui-components/Button"
import Switch from "@/components/ui-components/Switch"
import Label from "@/components/ui-components/Input"

export default function SettingsPage() {
  const [name, setName] = useState("Jane Doe")
  const [email, setEmail] = useState("janedoe@example.com")
  const [darkMode, setDarkMode] = useState(false)

  const handleSave = () => {
    console.log({ name, email, darkMode })
    // TODO: save to backend
    alert("Settings saved!")
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
          <Label htmlFor="dark-mode">Enable dark mode</Label>
        </div>

        <Button onClick={handleSave} className="mt-4">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
