"use client";

import { useEffect, useRef } from "react";
import { getStompClient } from "@/utils/socket";
import { toast } from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";
import { useRouter } from "next/navigation";

export default function useMessageNotification(userId) {
  const subscriptionRef = useRef(null);
  const isSubscribedRef = useRef(false);
  const router = useRouter();

  // Store actions
  const { fetchChatList, onMessageReceived, onChatCreated, selectChat } = useAppStore();

  // Hàm helper để cập nhật chatList
  const updateChatList = (newMessage, chatId) => {
    console.log("🔄 Processing message for chatList:", newMessage);
    const { chatList } = useAppStore.getState();
    console.log("📜 Current chatList:", chatList);

    const foundChat = chatList.find((c) => c.chatId === chatId);
    if (foundChat) {
      const updatedChat = {
        ...foundChat,
        latestMessage: {
          id: newMessage.id,
          content: newMessage.content,
          sentAt: newMessage.sentAt,
          sender: newMessage.sender,
          messageType: newMessage.messageType,
          attachment: newMessage.attachment,
          attachments: newMessage.attachments,
          deleted: newMessage.deleted || false,
        },
        updatedAt: newMessage.sentAt,
        notReadMessageCount:
          (foundChat.notReadMessageCount || 0) + (newMessage.isOwnMessage ? 0 : 1),
      };
      const otherChats = chatList.filter((c) => c.chatId !== chatId);
      const newChatList = [...otherChats, updatedChat].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      useAppStore.setState({ chatList: newChatList.map((chat) => ({ ...chat })) });
      console.log("✅ ChatList updated successfully!");
    } else {
      console.warn(`⚠️ Không tìm thấy chat với chatId: ${chatId}`);
    }
  };

  // Message handler
  const handleMessage = async (messageData) => {
    if (!messageData) return;
    console.log("📨 New message received:", messageData);

    try {
      // Lấy currentUserId từ localStorage khi cần
      const currentUserId = localStorage.getItem("userId");

      // Command xử lý riêng
      if (messageData.command === "DELETE") {
        toast(`🗑️ Tin nhắn đã bị xóa`, {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      if (messageData.command === "EDIT") {
        const senderName = messageData.sender?.username || messageData.sender?.givenName || "ai đó";
        if (messageData.sender?.id !== currentUserId) {
          toast(`✏️ ${senderName} đã chỉnh sửa tin nhắn`, {
            duration: 3000,
            position: "top-right",
          });
        }
        return;
      }

      const newMessage = {
        ...messageData,
        isOwnMessage: messageData.sender?.id === currentUserId,
      };

      // Cập nhật chat list
      if (messageData.chatId) {
        requestAnimationFrame(() => {
          updateChatList(newMessage, messageData.chatId);
        });
      }

      // Toast thông báo kèm click handler - chỉ cho tin nhắn từ người khác
      if (
        messageData.sender &&
        messageData.content &&
        !newMessage.isOwnMessage
      ) {
        const senderName = messageData.sender.username || messageData.sender.givenName || "ai đó";

        toast(
          (t) => (
            <div
              onClick={() => {
                selectChat(messageData.chatId);
                router.push("/chats");
                toast.dismiss(t.id);
              }}
              className="cursor-pointer"
            >
              💬 {senderName}: {messageData.content}
            </div>
          ),
          {
            duration: 4000,
            position: "top-right",
          }
        );
      }

      if (onMessageReceived) {
        onMessageReceived(messageData);
      }

      window.dispatchEvent(
        new CustomEvent("newMessageReceived", {
          detail: messageData,
        })
      );
    } catch (error) {
      console.error("❌ Failed to process message:", error);
    }
  };

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    // === Setup socket client với singleton pattern giống useNotificationSocket ===
    const setupConnection = async () => {
      try {
        console.log("🔌 Connecting to message socket for user:", userId);
        
        const client = await getStompClient(() => {
          if (!isMounted || isSubscribedRef.current) return;

          console.log("🔌 Subscribing to /message/" + userId);
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/message/${userId}`,
              (message) => {
                if (!isMounted) return;
                try {
                  const data = JSON.parse(message.body);
                  console.log("📨 Message received:", data);
                  handleMessage(data);
                } catch (err) {
                  console.error("❌ Không thể parse message:", err);
                }
              }
            );
            
            if (subscriptionRef.current) {
              isSubscribedRef.current = true;
              console.log("✅ Successfully subscribed to messages");
            }
          } catch (err) {
            console.error("❌ Lỗi khi subscribe:", err);
          }
        });

        // Nếu client đã connected và chưa subscribe
        if (client?.connected && !isSubscribedRef.current) {
          console.log("🔌 Client already connected, subscribing immediately");
          try {
            subscriptionRef.current = client.subscribeToChannel(
              `/message/${userId}`,
              (message) => {
                if (!isMounted) return;
                try {
                  const data = JSON.parse(message.body);
                  console.log("📨 Message received:", data);
                  handleMessage(data);
                } catch (err) {
                  console.error("❌ Không thể parse message:", err);
                }
              }
            );
            
            if (subscriptionRef.current) {
              isSubscribedRef.current = true;
              console.log("✅ Successfully subscribed to messages");
            }
          } catch (err) {
            console.error("❌ Lỗi khi subscribe:", err);
          }
        }

      } catch (err) {
        console.error("❌ Lỗi khi setup connection:", err);
      }
    };

    setupConnection();

    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /message/" + userId);
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký:", err);
        }
        subscriptionRef.current = null;
      }
      
      isSubscribedRef.current = false;
    };
  }, [
    userId,
    fetchChatList,
    onMessageReceived,
    onChatCreated,
    selectChat,
  ]);

  return {
    // Có thể return các utility functions nếu cần
    isConnected: isSubscribedRef.current,
  };
}