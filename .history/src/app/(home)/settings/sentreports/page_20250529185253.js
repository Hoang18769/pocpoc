"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const mockReports = [
  {
    id: 1,
    type: "user",
    reportedAt: "2025-05-25",
    status: "pending",
    reason: "Người dùng có hành vi quấy rối",
    target: { name: "Nguyễn Văn A", avatar: "/avatar/a.jpg" },
  },
  {
    id: 2,
    type: "post",
    reportedAt: "2025-05-20",
    status: "resolved",
    reason: "Bài viết có nội dung bạo lực",
    target: { content: "Đoạn nội dung không phù hợp...", image: "https://picsum.photos/300" },
  },
  {
    id: 3,
    type: "image",
    reportedAt: "2025-05-18",
    status: "pending",
    reason: "Ảnh phản cảm",
    target: { image: "https://picsum.photos/400" },
  },
  {
    id: 4,
    type: "comment",
    reportedAt: "2025-05-22",
    status: "resolved",
    reason: "Bình luận có ngôn từ kích động",
    target: { user: "johndoe", content: "Tụi bây ngu hết" },
  },
]

export default function ReportsPage() {
  const [tab, setTab] = useState("all")

  const filtered = tab === "all" ? mockReports : mockReports.filter(r => r.type === tab)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Báo cáo đã gửi</h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="user">Người dùng</TabsTrigger>
          <TabsTrigger value="post">Bài viết</TabsTrigger>
          <TabsTrigger value="comment">Bình luận</TabsTrigger>
          <TabsTrigger value="image">Hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-4">
          {filtered.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                <span>Ngày gửi: {report.reportedAt}</span>
                <span className={`capitalize font-medium ${report.status === "resolved" ? "text-green-600" : "text-yellow-600"}`}>
                  {report.status === "pending" ? "Đang xử lý" : "Đã xử lý"}
                </span>
              </div>

              <p className="text-sm mb-2"><span className="font-semibold">Lý do:</span> {report.reason}</p>

              {report.type === "user" && (
                <div className="flex items-center gap-3">
                  <img src={report.target.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-medium">{report.target.name}</span>
                </div>
              )}

              {report.type === "post" && (
                <div className="flex items-center gap-3">
                  <img src={report.target.image} alt="Post" className="w-20 h-20 object-cover rounded-md" />
                  <p className="text-sm text-muted-foreground line-clamp-3">{report.target.content}</p>
                </div>
              )}

              {report.type === "image" && (
                <img src={report.target.image} alt="Ảnh bị báo cáo" className="w-full max-w-sm h-auto rounded-md" />
              )}

              {report.type === "comment" && (
                <div>
                  <p className="text-sm"><span className="font-medium">{report.target.user}:</span> {report.target.content}</p>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
