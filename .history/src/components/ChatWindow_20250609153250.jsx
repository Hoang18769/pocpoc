// src/components/chat/ChatWindow.jsx
import { useEffect, useState } from "react";
import useChatSocket from "@/hooks/useChatSocket";

export default function ChatWindow({ currentChat }) {
  const [messages, setMessages] = useState([]);

  const { sendMessage } = useChatSocket({
    onMessageReceived: (msg) => {
      if (msg.chatId === currentChat.id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        // có thể hiện thông báo ở ngoài (vì chat khác đang active)
      }
    },
  });

  const handleSend = (text) => {
    const newMessage = {
      content: text,
      chatId: currentChat.id,
      recipientUsername: currentChat.otherUsername, // người nhận
    };
    sendMessage(newMessage);
    setMessages((prev) => [...prev, { ...newMessage, self: true }]);
  };

  useEffect(() => {
    // load tin nhắn lịch sử từ backend
    fetch(`/v1/chat/messages/${currentChat.id}`)
      .then((res) => res.json())
      .then((res) => {
        setMessages(res.data || []);
      });
  }, [currentChat]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded-xl max-w-[70%] ${
              msg.self || msg.senderId === currentChat.currentUserId
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 text-black"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}

function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-2 border-t">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-full"
        placeholder="Nhắn gì đó..."
      />
      <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-full">
        Gửi
      </button>
    </form>
  );
}
