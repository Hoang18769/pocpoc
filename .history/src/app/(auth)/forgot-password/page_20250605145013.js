"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowDown, ArrowLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import useMeasure from "react-use-measure"
import MotionContainer from "@/components/ui-components/MotionContainer"
import Button from "@/components/ui-components/Button"
import Connectimg from "@/assests/photo/Connect.jpg"
import api from "@/utils/axios"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef(null)
  const router = useRouter()

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const [formBoundsRef, { height }] = useMeasure()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    if (!email) return alert("Vui lòng nhập email.")

    setLoading(true)
    try {
      const res = await api.post("/v1/auth/forgot-password", { email })
      if (res.data.code === 200) {
        setMessage("✅ Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư.")
        setEmail("")
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại."
      setMessage(`❌ ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row h-full">
        {/* Left side image */}
        <div className="w-full md:w-1/2 h-screen flex items-center justify-center bg-muted relative">
          <Image
            src={Connectimg}
            alt="Network illustration"
            width={400}
            height={400}
            className="max-w-full h-auto object-contain"
            priority
          />
          <div className="absolute bottom-10 left-0 right-0 flex justify-center md:hidden">
            <button
              onClick={scrollToForm}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
            >
              Khôi phục mật khẩu
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right side form */}
        <div
          ref={formRef}
          className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-background"
        >
          <div
            className="w-full max-w-md text-card-foreground rounded-xl p-8 shadow-xl bg-[var(--card)]"
            style={{ overflow: "hidden" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Khôi phục mật khẩu</h1>
              <button
                onClick={() => router.back()}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="inline-block w-4 h-4 mr-1" />
                Quay lại
              </button>
            </div>

            <motion.div animate={{ height }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
              <div ref={formBoundsRef}>
                <AnimatePresence mode="wait">
                  <MotionContainer key="forgot-password" modeKey="forgot-password" effect="fadeUp">
                    {message && (
                      <div
                        className={`p-3 text-sm rounded mb-4 ${
                          message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2"
                      >
                        {loading ? "Đang gửi..." : "Gửi email khôi phục"}
                      </Button>
                    </form>
                  </MotionContainer>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
