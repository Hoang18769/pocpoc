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

        // ✅ Keep original order from API (newest first)
        set({ 
          chatList: data, 
          conversationMap,
          isLoadingChats: false,
          error: null
        });

        console.log(`📊 ${STORE_EVENTS.CHAT_LIST_LOAD}`, data);
      } catch (error) {
        console.error('❌ Error fetching chats:', error);
        set({ 
          isLoadingChats: false, 
          error: 'Failed to load chats' 
        });
      }
    },

    updateChatListAfterMessage: (chatId, lastMessage) => {
      set((state) => ({
        chatList: state.chatList.map(chat => 
          (chat.id === chatId || chat.chatId === chatId)
            ? { ...chat, lastMessage, updatedAt: new Date().toISOString() }
            : chat
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      }));
    },

    getUserByChatId: (chatId) => {
      const chat = get().chatList.find(c => (c.id === chatId || c.chatId === chatId));
      return chat ? chat.user : null;
    },

    markChatAsRead: async (chatId) => {
      console.log(`🔍 Marking chat as read: ${chatId}`);
      
      set(state => ({
        chatList: state.chatList.map(chat => {
          const isChatMatch = chat.chatId === chatId || chat.id === chatId;
          if (isChatMatch) {
            console.log(`✅ Found chat to mark as read:`, {
              chatId: chat.chatId || chat.id,
              currentCount: chat.notReadMessageCount,
              newCount: 0
            });
            return { ...chat, notReadMessageCount: 0 };
          }
          return chat;
        })
      }));   
    },

    onMessageReceived: (message, isCurrentChatOpen = false) => {
      set(state => {
        const updatedChats = state.chatList
          .map(chat => {
            if (chat.chatId === message.chatId || chat.id === message.chatId) {
              const newCount = isCurrentChatOpen 
                ? 0 
                : (chat.notReadMessageCount || 0) + 1;
              
              console.log(`📨 Message received for chat ${message.chatId}:`, {
                isCurrentChatOpen,
                oldCount: chat.notReadMessageCount || 0,
                newCount
              });

              return { 
                ...chat, 
                lastMessage: message, 
                updatedAt: message.createdAt,
                notReadMessageCount: newCount
              };
            }
            return chat;
          })
          // ✅ Fix: Sort descending (newest first) to maintain correct order
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return { chatList: updatedChats };
      });

      console.log(`📊 ${STORE_EVENTS.MESSAGE_RECEIVED} - ${message.chatId}`);
    },

    onChatCreated: (newChat) => {
      const currentUserId = getCurrentUserId();
      const otherUser = newChat.participants?.find(p => p.id !== currentUserId);

      set(state => ({
        // ✅ Add new chat at the beginning (newest first)
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

    fetchNotifications: async (force = false, page = 0, size = 10) => {
      const { notifications, isLoadingNotifications } = get();
      
      if (!force && notifications.length > 0) {
        return;
      }
      
      if (isLoadingNotifications) {
        return;
      }

      set({ isLoadingNotifications: true, error: null });
      try {
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
        
        const unreadCount = data.filter(notification => !notification.isRead).length;
        
        set({ 
          notifications: data,
          unreadNotificationCount: unreadCount,
          isLoadingNotifications: false,
          error: null
        });

        console.log(`📊 ${STORE_EVENTS.NOTIFICATIONS_LOAD} - ${data.length} notifications, ${unreadCount} unread`);
        return data;
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
      
      if (notifications.length === 0) {
        console.log('📊 Empty notifications list, fetching from API...');
        get().fetchNotifications(true);
        return;
      }

      const existingNotification = notifications.find(n => n.id === notification.id);
      if (existingNotification) {
        console.log(`📊 Notification ${notification.id} already exists, skipping...`);
        return;
      }

      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationCount: notification.isRead 
          ? state.unreadNotificationCount 
          : state.unreadNotificationCount + 1
      }));

      console.log(`📊 ${STORE_EVENTS.NOTIFICATION_RECEIVED} - ${notification.id || 'new notification'}`);
    },

    markNotificationAsRead: async (notificationId) => {
      try {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
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

    // ============ CHAT NAVIGATION & SELECTION LOGIC ============
    selectedChatId: null,
    virtualChatUser: null,

    navigateToChat: (userId, userInfo = null) => {
      const { chatList } = get();

      const existingChat = chatList.find(chat => 
        chat.target && chat.target.username === userInfo?.username
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
      }, true);
    },

    getChatByUserId: (userId) => get().conversationMap.get(userId),
    
    getSelectedChat: () => {
      const { selectedChatId, chatList } = get();
      return chatList.find(chat => (chat.id === selectedChatId || chat.chatId === selectedChatId)) || null;
    },

    // ============ AUTO FETCH NOTIFICATIONS ============
    ensureNotificationsLoaded: () => {
      const { notifications, isLoadingNotifications } = get();
      
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