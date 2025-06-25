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

    // ✅ FIXED: Return Promise and handle errors properly
    fetchChatList: async () => {
      set({ isLoadingChats: true, error: null });
      try {
        console.log('🚀 Fetching chat list from API...');
        const res = await api.get('/v1/chat');
        console.log('📊 Chat API response:', res);
        
        const data = res.data.body || res.data || [];
        const conversationMap = new Map();
        const currentUserId = getCurrentUserId();

        // ✅ Build conversation map
        data.forEach(chat => {
          const otherUser = chat.participants?.find(p => p.id !== currentUserId);
          if (otherUser) {
            conversationMap.set(otherUser.id, chat.id);
          }
        });

        // ✅ Reverse the chat list when fetching
        const reversedData = [...data].reverse();

        set({ 
          chatList: reversedData, 
          conversationMap,
          isLoadingChats: false,
          error: null
        });

        console.log(`✅ ${STORE_EVENTS.CHAT_LIST_LOAD} - ${reversedData.length} chats loaded`);
        return reversedData; // ✅ Return data for component
      } catch (error) {
        console.error('❌ Error fetching chats:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load chats';
        
        set({ 
          isLoadingChats: false, 
          error: errorMessage,
          chatList: [] // ✅ Reset on error
        });
        
        throw error; // ✅ Re-throw for component to handle
      }
    },

    // ✅ FIXED: Better update logic
    updateChatListAfterMessage: (chatId, lastMessage) => {
      set((state) => ({
        chatList: state.chatList.map(chat => 
          (chat.id === chatId || chat.chatId === chatId)
            ? { ...chat, lastMessage, updatedAt: new Date().toISOString() }
            : chat
        ).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      }));
    },

    getUserByChatId: (chatId) => {
      const chat = get().chatList.find(c => (c.id === chatId || c.chatId === chatId));
      return chat ? chat.target : null;
    },

    markChatAsRead: async (chatId) => {
      try {
        // ✅ Call API if needed
        // await api.patch(`/v1/chat/${chatId}/read`);
        
        set(state => ({
          chatList: state.chatList.map(chat => 
            (chat.chatId === chatId || chat.id === chatId)
              ? { ...chat, notReadMessageCount: 0 }
              : chat
          )
        }));   
        
        console.log(`✅ Marked chat ${chatId} as read`);
      } catch (error) {
        console.error('❌ Error marking chat as read:', error);
      }
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
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

        return { chatList: updatedChats };
      });

      console.log(`📊 ${STORE_EVENTS.MESSAGE_RECEIVED} - ${message.chatId}`);
    },

    onChatCreated: (newChat) => {
      const currentUserId = getCurrentUserId();
      const otherUser = newChat.participants?.find(p => p.id !== currentUserId);

      set(state => ({
        // ✅ Add new chat at the beginning (most recent)
        chatList: [newChat, ...state.chatList],
        conversationMap: otherUser 
          ? new Map(state.conversationMap).set(otherUser.id, newChat.id)
          : state.conversationMap
      }));

      console.log(`📊 ${STORE_EVENTS.CHAT_CREATED} - ${newChat.id}`);
    },

    // ============ NOTIFICATIONS STATE ============
    notifications: [],
    isLoadingNotifications: false,
    unreadNotificationCount: 0,

    // ✅ FIXED: Return Promise
    fetchNotifications: async (force = false, page = 0, size = 10) => {
      const { notifications, isLoadingNotifications } = get();
      
      if (!force && notifications.length > 0) {
        return notifications;
      }
      
      if (isLoadingNotifications) {
        return notifications;
      }

      set({ isLoadingNotifications: true, error: null });
      try {
        console.log('🚀 Fetching notifications from API...');
        const res = await api.get('/v1/notifications', {
          params: { page, size }
        });
        
        console.log('📊 Notifications API response:', res);
        
        const responseData = res.data;
        let data = [];
        
        if (responseData) {
          if (responseData.body && Array.isArray(responseData.body)) {
            data = responseData.body;
          } else if (Array.isArray(responseData)) {
            data = responseData;
          }
        }
        
        const currentNotifications = get().notifications;
        let finalNotifications = data;
        let unreadCount = 0;
        
        if (currentNotifications.length > 0) {
          const apiNotificationIds = new Set(data.map(n => n.id));
          const socketOnlyNotifications = currentNotifications.filter(n => !apiNotificationIds.has(n.id));
          
          finalNotifications = [...socketOnlyNotifications, ...data];
          unreadCount = finalNotifications.filter(n => !n.isRead).length;
        } else {
          unreadCount = data.filter(n => !n.isRead).length;
        }
        
        set({ 
          notifications: finalNotifications,
          unreadNotificationCount: unreadCount,
          isLoadingNotifications: false,
          error: null
        });

        console.log(`✅ ${STORE_EVENTS.NOTIFICATIONS_LOAD} - ${finalNotifications.length} notifications, ${unreadCount} unread`);
        return finalNotifications;
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load notifications';
        
        set({ 
          isLoadingNotifications: false,
          error: errorMessage
        });
        
        throw error;
      }
    },

    onNotificationReceived: (notification) => {
      const { notifications } = get();
      
      if (notifications.length === 0) {
        console.log('📊 Empty notifications list, fetching from API...');
        get().fetchNotifications(true).catch(console.error);
      }

      const existingNotification = notifications.find(n => n.id === notification.id);
      if (existingNotification) {
        console.log(`📊 Notification ${notification.id} already exists, skipping...`);
        return;
      }

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
        const { notifications } = get();
        const notification = notifications.find(n => n.id === notificationId);
        
        if (!notification || notification.isRead) {
          return;
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
        set(state => ({
          notifications: state.notifications.map(notification =>
            ({ ...notification, isRead: true })
          ),
          unreadNotificationCount: 0
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
        set({ 
          notifications: [],
          unreadNotificationCount: 0
        });
      } catch (error) {
        console.error('❌ Error clearing all notifications:', error);
      }
    },

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
        chat.target && (chat.target.username === userInfo?.username || chat.target.id === userId)
      );

      if (existingChat) {
        console.log(`🚀 Navigating to existing chat: ${existingChat.chatId || existingChat.id} with user: ${userId}`);
        return {
          type: 'existing',
          chatId: existingChat.chatId || existingChat.id,
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
        await Promise.allSettled([
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
      }, false, 'clearAllData'); // ✅ Better devtools action name
    },

    getChatByUserId: (userId) => get().conversationMap.get(userId),
    
    getSelectedChat: () => {
      const { selectedChatId, chatList } = get();
      return chatList.find(chat => (chat.id === selectedChatId || chat.chatId === selectedChatId)) || null;
    },

    ensureNotificationsLoaded: () => {
      const { notifications, isLoadingNotifications } = get();
      
      if (notifications.length === 0 && !isLoadingNotifications) {
        console.log('📊 Auto-fetching notifications (empty list)...');
        get().fetchNotifications(true).catch(console.error);
      }
    },

    // ✅ NEW: Force refresh methods
    refreshChatList: async () => {
      console.log('🔄 Force refreshing chat list...');
      return get().fetchChatList();
    },

    refreshNotifications: async () => {
      console.log('🔄 Force refreshing notifications...');
      return get().fetchNotifications(true);
    },

  }), {
    name: 'app-store'
  })
);

// ✅ FIXED: Better getCurrentUserId with fallback
function getCurrentUserId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId') || null;
  }
  return null;
}

export default useAppStore;