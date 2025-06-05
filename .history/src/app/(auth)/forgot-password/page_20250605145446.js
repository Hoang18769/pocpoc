'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'
import api from '@/utils/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Vui lòng nhập email.')

    setLoading(true)
    try {
      const origin = window.location.origin
      await api.post('/v1/update-password', null, {
        params: { email },
        headers: {
          'X-Continue-Page': `${origin}/reset-password`,
        },
      })

      toast.success('Đã gửi email khôi phục! Vui lòng kiểm tra hộp thư.')
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto mt-24"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Nhập email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
        </Button>
      </form>
    </motion.div>
  )
}
