"use client";

import { useState } from "react";
import Button from "@/components/ui-components/Button";
import Input from "@/components/ui-components/Input";
import Textarea from "@/components/ui-components/TextArea";
import NewPostModal from "@/components/social-app-component/CreatePostForm";
import Badge from "@/components/ui-components/Badge";
import Switch from "@/components/ui-components/Switch";
export default function DemoPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div>
            <Badge>Button</Badge>
        <Button variant="primary"           onClick={() => setShowModal(true)}
>Open modal</Button>
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
        >
          Create Post
        </button>

        <NewPostModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <div className="border p-4 rounded-xl bg-[var(--card)] text-[var(--card-foreground)]">
        <div className="flex items-center gap-3">
        <span>Trạng thái:</span>
        <Switch checked={enabled} onChange={setEnabled} />
        <span>{enabled ? "Bật" : "Tắt"}</span>
    </div>
      </div>
    </>
  );
}
