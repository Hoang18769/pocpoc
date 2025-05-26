"use client";

import { useState } from "react";
import Button from "@/components/ui-components/Button";
import Input from "@/components/ui-components/Input";
import Textarea from "@/components/ui-components/TextArea";
import NewPostModal from "@/components/social-app-component/CreatePostForm";
import Badge from "@/components/ui-components/Badge";
import Switch from "@/components/ui-components/Switch";
import ThemeToggle from "@/components/ui-components/Themetoggle";
import Avatar from '@/components/ui-components/Avatar'
import avt from "@/assests/photo/AfroAvatar.png"
export default function DemoPage() {
  const [showModal, setShowModal] = useState(false);
  const [enabled, setEnabled] = useState(false);

  return (
    <>
            <Badge>Button</Badge>
            <div>
        <Avatar src={avt} alt="User 2"  size={70} />
      </div>
      <div className="flex">
        <Button variant="primary"           onClick={() => setShowModal(true)}
>Open modal</Button>
       
                <Switch checked={enabled} onChange={setEnabled} />
                <ThemeToggle/>
      </div>
      <div>
        <Input label="Email" name="email" field />
        <Input label="Password" name="password" type="password" />
        <Input label="Search" placeholder="Tìm kiếm..." />
      </div>
      <div>
        <Textarea label="Trả lời" field rows={1} />
      </div>
      <div>
       

        <NewPostModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <div className="flex items-center gap-3">
    </div>
      </div>
    </>
  );
}
