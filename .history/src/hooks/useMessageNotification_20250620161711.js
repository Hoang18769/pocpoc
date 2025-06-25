"use client";
import { useEffect, useRef } from "react";
import { createStompClient } from "@/utils/socket";
import toast from "react-hot-toast";
import useAppStore from "@/store/ZustandStore";

export default function useMessageNotification(userId) {
  const subscriptionRef = useRef(null);
  const clientRef = useRef(null);

  // Store actions
  const {
    fetchChatList,
    onMessageReceived,
    onChatCreated,
  } = useAppStore();

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const handleMessage = async (messageData) => {
      if (!messageData) {
        console.warn("⚠️ Message data không hợp lệ:", messageData);
        return;
      }

      console.log("📨 New message received:", messageData);

      // Lấy thông tin người gửi
      const senderName = messageData.sender?.name || 
                        messageData.sender?.givenName || 
                        messageData.senderUsername || 
                        "ai đó";

      // Hiển thị toast notification
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src={messageData.sender?.avatar || '/default-avatar.png'}
                  alt={senderName}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {senderName}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {messageData.content || messageData.message || messageData.body || 'Tin nhắn mới'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                // Dispatch custom event để mở chat
                window.dispatchEvent(new CustomEvent('openChat', {
                  detail: {
                    chatId: messageData.chatId,
                    targetUser: messageData.sender
                  }
                }));
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Xem
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right',
      });

      // Cập nhật chatList nếu có thông tin message
      try {
        if (messageData.senderUsername) {
          // Truy xuất chatList từ store
          const { chatList } = useAppStore.getState();

          const foundChat = chatList.find(
            (chat) => chat.target?.username === messageData.senderUsername
          );

          if (foundChat) {
            const updatedChat = {
              ...foundChat,
              lastMessage: {
                ...foundChat.lastMessage,
                body: messageData.content || messageData.message || messageData.body,
              },
              updatedAt: messageData.createdAt || new Date().toISOString(),
              notReadMessageCount: (foundChat.notReadMessageCount || 0) + 1,
            };

            // Tạo chatList mới: chat này đứng đầu, còn lại giữ nguyên nhưng sắp theo updatedAt
            const newChatList = [
              updatedChat,
              ...chatList
                .filter((chat) => chat.id !== foundChat.id)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
            ];

            useAppStore.setState({ chatList: newChatList });

            console.log("📥 Cập nhật chatList với message từ", messageData.senderUsername);
          } else {
            console.log("🔍 Không tìm thấy chat với", messageData.senderUsername, "- giữ nguyên danh sách.");
          }
        }

        // Gọi onMessageReceived để cập nhật store
        if (onMessageReceived) {
          onMessageReceived(messageData);
        }

        // Dispatch custom event để các component khác có thể listen
        window.dispatchEvent(new CustomEvent('newMessageReceived', {
          detail: messageData
        }));

      } catch (err) {
        console.error("❌ Failed to process message:", err);
      }
    };

    // === Setup socket client ===
    const client = createStompClient((frame) => {
      if (!isMounted) return;

      console.log("🔌 Subscribing to /message/" + userId);
      try {
        subscriptionRef.current = client.subscribeToChannel(
          `/message/${userId}`,
          (message) => {
            try {
              const messageData = JSON.parse(message.body);
              console.log("📨 Message received via STOMP:", messageData);
              handleMessage(messageData);
            } catch (err) {
              console.error("❌ Không thể parse message:", err);
            }
          }
        );
      } catch (err) {
        console.error("❌ Lỗi khi subscribe to messages:", err);
      }
    });

    clientRef.current = client;

    try {
      client.activate();
      console.log("🚀 Activating message client for userId:", userId);
    } catch (err) {
      console.error("❌ Lỗi kích hoạt message client:", err);
    }

    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log("📤 Đã hủy đăng ký /message");
        } catch (err) {
          console.warn("⚠️ Lỗi khi hủy đăng ký message:", err);
        }
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
          console.log("🔌 Đã ngắt kết nối message client");
        } catch (err) {
          console.warn("⚠️ Lỗi khi ngắt kết nối message client:", err);
        }
        clientRef.current = null;
      }
    };
  }, [userId, fetchChatList, onMessageReceived, onChatCreated]);

  // Method để gửi message qua STOMP client (nếu cần)
  const sendMessage = (destination, message) => {
    if (clientRef.current && clientRef.current.connected) {
      try {
        clientRef.current.publish({
          destination: destination,
          body: JSON.stringify(message)
        });
        console.log("📤 Message sent via STOMP:", message);
      } catch (error) {
        console.error("❌ Error sending message via STOMP:", error);
      }
    } else {
      console.warn("⚠️ STOMP client is not connected");
    }
  };

  // Debug function để kiểm tra connection status
  const getConnectionStatus = () => {
    return {
      isConnected: clientRef.current?.connected || false,
      hasSubscription: !!subscriptionRef.current,
      userId: userId
    };
  };

  return {
    sendMessage,
    getConnectionStatus
  };
}