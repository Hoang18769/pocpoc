"use client";

import { useState } from "react";
import Button from "@/components/ui-components/Button";
import Input from "@/components/ui-components/Input";
import Textarea from "@/components/ui-components/TextArea";
import NewPostModal from "@/components/social-app-component/CreatePostForm";
import Ba
export default function DemoPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div>
        <Button variant="primary">Đăng bài</Button>
        <Button variant="ghost">Hủy</Button>
        <Button variant="outline" disabled>
          Đang tải...
        </Button>
      </div>

      <div>
        <Input label="Email" name="email" field />
        <Input label="Password" name="password" type="password" />
        <Input label="Search" placeholder="Tìm kiếm..." />
      </div>

      <div>
        <Textarea label="Mô tả" placeholder="Nhập nội dung..." />
        <Textarea label="Trả lời" field rows={1} />
      </div>

      <div>
        <button
          className="btn-base bg-[var(--primary)] text-[var(--primary-foreground)]"
          onClick={() => setShowModal(true)}
        >
          Create Post
        </button>

        <NewPostModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <div className="space-y-4 p-4">
      <Badge>Default Badge</Badge>
      <Badge variant="primary">Primary Badge</Badge>
      <Badge variant="outline">Outline Badge</Badge>

      <div className="p-4 border rounded-lg">
        <Badge variant="primary" className="mb-2 block">Bài viết nổi bật</Badge>
        <p>Đây là nội dung của một bài viết...</p>
      </div>
    </div>
      </div>
    </>
  );
}
