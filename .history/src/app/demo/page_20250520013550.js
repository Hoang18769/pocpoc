"use client";

import { useState } from "react";
import Button from "@/components/ui-components/Button";
import Input from "@/components/ui-components/Input";
import Textarea from "@/components/ui-components/TextArea";
import NewPostModal from "@/components/social-app-component/CreatePostForm";
import Badge from "@/components/ui-components/Heading";
import Switch from "@/components/ui-components/Switch";
import ThemeToggle from "@/components/ui-components/Themetoggle";
import Avatar from '@/components/ui-components/Avatar'
import avt from "@/assests/photo/AfroAvatar.png"
import Card from "@/components/ui-components/Card";
import Heading from "@/components/ui-components/Heading";
import PostCard from "@"
export default function DemoPage() {
  const [showModal, setShowModal] = useState(false);
  const [enabled, setEnabled] = useState(false);
const postWithImage = {
    user: {
      name: "Name",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "57 minutes ago",
    content:
      "Lorem ipsum dolor sit amet. Hic neque vitae sit vero explicabo est nobis voluptatem! Et odio obcaecati ut obcaecati voluptatum et eaque illo in sapiente minima ut delectus magni qui iure fugit",
    image: "/placeholder.svg?height=400&width=400",
    likes: 32800,
    comments: [
      {
        user: {
          name: "name",
          avatar: "/placeholder.svg?height=24&width=24",
        },
        content: "Lorem ipsum dolor sit amet.",
        timestamp: "23m",
        likes: 25,
      },
      {
        user: {
          name: "user2",
          avatar: "/placeholder.svg?height=24&width=24",
        },
        content: "Great post!",
        timestamp: "15m",
        likes: 10,
      },
    ],
  }

  const postWithoutImage = {
    user: {
      name: "Name",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "2 hours ago",
    content: "This is a post without an image. The text will be displayed in the image area when no image is provided.",
    likes: 156,
    comments: [
      {
        user: {
          name: "commenter",
          avatar: "/placeholder.svg?height=24&width=24",
        },
        content: "Nice thought!",
        timestamp: "45m",
        likes: 5,
      },
    ],
  }
  return (
    <>
            <Heading>Button</Heading>
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
        <Card >        <Avatar src={avt} alt="User 2"  size={70} />
</Card>
      
      </div>
      <div>
        <Textarea label="Trả lời" field rows={1} />
      </div>
      <div>
       

        <NewPostModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <div className="flex items-center gap-3">
         <PostCard {...postWithImage} />
        <PostCard {...postWithoutImage} />

    </div>
      </div>
    </>
  );
}
