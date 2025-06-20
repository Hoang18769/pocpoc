import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/utils/axios'; 

// Event constants
export const STORE_EVENTS = {
  CHAT_LIST_LOAD: 'chat_list_load',
  CHAT_CREATED: 'chat_created',
  MESSAGE_RECEIVED: 'message_received',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATIONS_LOAD: 'notifications_load',
  NEWSFEED_LOAD: 'newsfeed_load',
  POST_CREATED: 'post_created',
  SEARCH_PERFORMED: 'search_performed',
};

const useAppStore = create(
  devtools((set, get) => ({
    // ============ CHAT STATE ============
    chatList: [],
    conversationMap: new Map(),
    isLoadingChats: false,
    error: null,

    fetchChatList: async () => {
      set({ isLoadingChats: true, error: null });
      try {
        const res = await api.get('/v1/chat');
        const data = res.data.body;
        const conversationMap = new Map();
        const currentUserId = getCurrentUserId();

        data.forEach(chat => {
          const otherUser = chat.participants?.find(p => p.id !== currentUserId);
          if (otherUser) conversationMap.set(otherUser.id, chat.id);
        });

        // ✅ Reverse the chat list when fetching
        const reversedData = [...data].reverse();

        set({ 
          chatList: reversedData, 
          conversationMap,
          isLoadingChats: false,
          error: null
        });

        console.log(`📊 ${STORE_EVENTS.CHAT_LIST_LOAD}`,reversedData);
      } catch (error) {
        console.error('❌ Error fetching chats:', error);
        set({ 
          isLoadingChats: false, 
          error: 'Failed to load chats' 
        });
      }
    },
// Trong store
updateChatListAfterMessage: (chatId, lastMessage) => {
  set((state) => ({
    chatList: state.chatList.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage, updatedAt: new Date().toISOString() }
        : chat
    ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }));
},
    getUserByChatId: (chatId) => {
      const chat = get().chatList.find(c => c.id === chatId);
      return chat ? chat.user : null;
    },

    markChatAsRead: async (chatId) => {
      set(state => ({
        chatList: state.chatList.map(chat => 
          (chat.chatId === chatId || chat.id === chatId)
            ? { ...chat, notReadMessageCount: 0 }
            : chat
        )
      }));   
    },

    onMessageReceived: (message, isCurrentChatOpen = false) => {
      set(state => {
        const updatedChats = state.chatList
          .map(chat => {
            if (chat.chatId === message.chatId || chat.id === message.chatId) {
              return { 
                ...chat, 
                lastMessage: message, 
                updatedAt: message.createdAt,
                notReadMessageCount: isCurrentChatOpen 
                  ? 0 
                  : (chat.notReadMessageCount || 0) + 1
              };
            }
            return chat;
          })
          .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)); // ✅ Sort ascending (oldest first)

        return { chatList: updatedChats };
      });

      console.log(`📊 ${STORE_EVENTS.MESSAGE_RECEIVED} - ${message.chatId} (maintaining reverse order)`);
    },

    onChatCreated: (newChat) => {
      const currentUserId = getCurrentUserId();
      const otherUser = newChat.participants?.find(p => p.id !== currentUserId);

      set(state => ({
        // ✅ Add new chat at the end (to maintain reverse chronological order)
        chatList: [...state.chatList, newChat],
        conversationMap: otherUser 
          ? new Map(state.conversationMap).set(otherUser.id, newChat.id)
          : state.conversationMap
      }));

      console.log(`📊 ${STORE_EVENTS.CHAT_CREATED} - ${newChat.id} (added to end)`);
    },

    // ============ NOTIFICATIONS STATE ============
    notifications: [],
    isLoadingNotifications: false,
    unreadNotificationCount: 0,

    fetchNotifications: async (force = false, page = 0, size = 10) => {
      const { notifications, isLoadingNotifications } = get();
      
      // Nếu đã có thông báo và không bắt buộc fetch lại, thì skip
      if (!force && notifications.length > 0) {
        return;
      }
      
      // Nếu đang loading, không fetch lại
      if (isLoadingNotifications) {
        return;
      }

      set({ isLoadingNotifications: true, error: null });
      try {
        const res = await api.get('/v1/notifications', {
          params: { page, size }
        });
        
        console.log('📊 Notifications API response:', res);
        
        // Xử lý response data giống như hook
        const responseData = res.data;
        let data = [];
        
        if (responseData) {
          // Kiểm tra các cấu trúc response khác nhau
         if (responseData.body && Array.isArray(responseData.body)) {
            data = responseData.body; // Body response
          } else if (Array.isArray(responseData)) {
            data = responseData; // Direct array
          }
        }
        
        // ✅ FIX: Chỉ tính count khi không có notifications từ socket
        const currentNotifications = get().notifications;
        let finalNotifications = data;
        let unreadCount = 0;
        
        if (currentNotifications.length > 0) {
          // ✅ Merge notifications từ API với notifications từ socket
          // Tránh duplicate bằng cách filter theo ID
          const apiNotificationIds = new Set(data.map(n => n.id));
          const socketOnlyNotifications = currentNotifications.filter(n => !apiNotificationIds.has(n.id));
          
          finalNotifications = [...socketOnlyNotifications, ...data];
          unreadCount = finalNotifications.filter(n => !n.isRead).length;
        } else {
          // ✅ Chỉ có notifications từ API
          unreadCount = data.filter(n => !n.isRead).length;
        }
        
        set({ 
          notifications: finalNotifications,
          unreadNotificationCount: unreadCount,
          isLoadingNotifications: false,
          error: null
        });

        console.log(`📊 ${STORE_EVENTS.NOTIFICATIONS_LOAD} - ${finalNotifications.length} notifications, ${unreadCount} unread`);
        return finalNotifications;
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        set({ 
          isLoadingNotifications: false,
          error: 'Failed to load notifications' 
        });
        throw error;
      }
    },

    onNotificationReceived: (notification) => {
      const { notifications } = get();
      
      // ✅ FIX: Nếu danh sách rỗng, fetch song song nhưng vẫn xử lý notification từ socket
      if (notifications.length === 0) {
        console.log('📊 Empty notifications list, fetching from API...');
        // Fetch song song, không return
        get().fetchNotifications(true);
        // Tiếp tục xử lý notification từ socket
      }

      // ✅ Kiểm tra xem thông báo đã tồn tại chưa (tránh duplicate)
      const existingNotification = notifications.find(n => n.id === notification.id);
      if (existingNotification) {
        console.log(`📊 Notification ${notification.id} already exists, skipping...`);
        return;
      }

      // ✅ Chỉ tăng count nếu notification chưa đọc
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationCount: !notification.isRead 
          ? state.unreadNotificationCount + 1
          : state.unreadNotificationCount
      }));

      console.log(`📊 ${STORE_EVENTS.NOTIFICATION_RECEIVED} - ${notification.id || 'new notification'}`);
    },

    markNotificationAsRead: async (notificationId) => {
      try {
        // ✅ Kiểm tra notification có tồn tại và chưa đọc không
        const { notifications } = get();
        const notification = notifications.find(n => n.id === notificationId);
        
        if (!notification || notification.isRead) {
          return; // Không cần update count
        }
        
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true }
              : n
          ),
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1)
        }));
      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
      }
    },

    markAllNotificationsAsRead: async () => {
      try {
        // Gọi API để đánh dấu tất cả đã đọc trên server (nếu cần)
        // await api.patch('/v1/notifications/read-all');
        
        set(state => ({
          notifications: state.notifications.map(notification =>
            ({ ...notification, isRead: true })
          ),
          unreadNotificationCount: 0 // ✅ Reset về 0
        }));
      } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
      }
    },

    removeNotification: (notificationId) => {
      set(state => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadNotificationCount: wasUnread 
            ? Math.max(0, state.unreadNotificationCount - 1)
            : state.unreadNotificationCount
        };
      });
    },

    clearAllNotifications: async () => {
      try {
        // Gọi API để xóa tất cả thông báo trên server (nếu cần)
        // await api.delete('/v1/notifications');
        
        set({ 
          notifications: [],
          unreadNotificationCount: 0
        });
      } catch (error) {
        console.error('❌ Error clearing all notifications:', error);
      }
    },

    // ✅ Thêm method để sync count từ notifications array
    syncUnreadCount: () => {
      const { notifications } = get();
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      set({ unreadNotificationCount: unreadCount });
      console.log(`📊 Synced unread count: ${unreadCount}`);
    },

    // ============ CHAT NAVIGATION & SELECTION LOGIC ============
    selectedChatId: null,
    virtualChatUser: null,

    navigateToChat: (userId, userInfo = null) => {
      const { chatList } = get();

      const existingChat = chatList.find(chat => 
        chat.target && chat.target.username === userInfo?.username
      );

      if (existingChat) {
        console.log(`🚀 Navigating to existing chat: ${existingChat.chatId} with user: ${userId}`);
        return {
          type: 'existing',
          chatId: existingChat.chatId,
          userId: userId
        };
      } else {
        console.log(`🚀 Creating virtual chat with user: ${userId}`);
        return {
          type: 'virtual',
          chatId: null,
          userId: userId,
          userInfo: userInfo
        };
      }
    },

    selectChat: (chatId) => {
      set({ 
        selectedChatId: chatId,
        virtualChatUser: null
      });
      console.log(`✅ Selected chat: ${chatId}`);
    },

    showVirtualChat: (userId, userInfo) => {
      set({ 
        selectedChatId: null,
        virtualChatUser: {
          id: userId,
          ...userInfo
        }
      });
      console.log(`✅ Showing virtual chat with user: ${userId}`);
    },

    clearChatSelection: () => {
      set({ 
        selectedChatId: null,
        virtualChatUser: null
      });
    },

    createNewChat: async (userId, firstMessage) => {
      try {
        const res = await api.post('/v1/chat', {
          participantId: userId,
          message: firstMessage
        });

        if (res.data.code === 200) {
          const newChat = res.data.body;
          get().onChatCreated(newChat);

          set({ 
            selectedChatId: newChat.id,
            virtualChatUser: null
          });

          console.log(`✅ New chat created and selected: ${newChat.id}`);
          return newChat;
        }
      } catch (error) {
        console.error('❌ Error creating new chat:', error);
        throw error;
      }
    },

    // ============ INITIALIZATION ============
    initializeApp: async () => {
      console.log('🚀 Initializing app...');
      try {
        // Fetch both chats and notifications in parallel
        await Promise.all([
          get().fetchChatList(),
          get().fetchNotifications()
        ]);
        console.log('✅ App initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        set({ error: 'Failed to initialize app' });
      }
    },

    // ============ UTILITY ============
    clearAllData: () => {
  set({
    chatList: [],
    conversationMap: new Map(),
    selectedChatId: null,
    virtualChatUser: null,
    notifications: [],
    unreadNotificationCount: 0,
    error: null,
    isLoadingChats: false,
    isLoadingNotifications: false,
  }, true); // 👈 Thêm `true` để notify devtools nếu đang dùng devtools middleware
},


    getChatByUserId: (userId) => get().conversationMap.get(userId),
    getSelectedChat: () => {
      const { selectedChatId, chatList } = get();
      return chatList.find(chat => chat.id === selectedChatId) || null;
    },

    // ============ AUTO FETCH NOTIFICATIONS ============
    ensureNotificationsLoaded: () => {
      const { notifications, isLoadingNotifications } = get();
      
      // Nếu danh sách rỗng và không đang loading, tự động fetch
      if (notifications.length === 0 && !isLoadingNotifications) {
        console.log('📊 Auto-fetching notifications (empty list)...');
        get().fetchNotifications(true);
      }
    },

  }), {
    name: 'app-store'
  })
);

function getCurrentUserId() {
  return localStorage.getItem('userId') || null;
}

export default useAppStore;