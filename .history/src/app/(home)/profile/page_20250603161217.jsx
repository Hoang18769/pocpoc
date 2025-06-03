import ProfileHeader from "@/components/social-app-component/ProfileHeader"
import PostCard from "@/components/social-app-component/Postcard"
import { useEffect } from "react"

export default function ProfilePage() {
  const username=localStorage.getItem("username");
  useEffect(()=>{
    try {
        const res = await api.patch(
          `/v1/users/${username}`,
          { email: emailParam, code: codeParam },
          { headers: { "Content-Type": "application/json" }, timeout: 10000 }
        )
        if (res.data.code === 200) {
          setVerifyMessage("✅ Xác thực email thành công! Bạn có thể đăng nhập.")
        }
      } catch (error) {
        console.error("Email verification error:", error)
        setVerifyMessage(`❌ Xác thực thất bại: ${parseApiError(error)}`)
      } finally {
        setVerifying(false)
      }
  },[])
  return (
    <main className=" max-w-4xl mx-auto mt-4">
      <ProfileHeader />
      
    </main>
  )
}
