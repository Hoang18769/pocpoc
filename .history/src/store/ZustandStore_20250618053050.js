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

        set({ 
          chatList: data, 
          conversationMap,
          isLoadingChats: false,
          error: null
        });

        console.log(`📊 ${STORE_EVENTS.CHAT_LIST_LOAD} - ${data.length} chats`);
      } catch (error) {
        console.error('❌ Error fetching chats:', error);
        set({ 
          isLoadingChats: false, 
          error: 'Failed to load chats' 
        });
      }
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
      set(state => ({
        chatList: state.chatList
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
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      }));

      console.log(`📊 ${STORE_EVENTS.MESSAGE_RECEIVED} - ${message.chatId}`);
    },

    onChatCreated: (newChat) => {
      const currentUserId = getCurrentUserId();
      const otherUser = newChat.participants?.find(p => p.id !== currentUserId);

      set(state => ({
        chatList: [newChat, ...state.chatList],
        conversationMap: otherUser 
          ? new Map(state.conversationMap).set(otherUser.id, newChat.id)
          : state.conversationMap
      }));

      console.log(`📊 ${STORE_EVENTS.CHAT_CREATED} - ${newChat.id}`);
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

    // ============ NOTIFICATIONS STATE ============
    notifications: [],
    isLoadingNotifications: false,
    notificationError: null,
    unreadNotificationCount: 0,

    fetchNotifications: async () => {
      set({ isLoadingNotifications: true, notificationError: null });
      try {
        const res = await api.get('/v1/notifications');
        const notifications = res.data.body || res.data || [];
        
        // Calculate unread count
        const unreadCount = notifications.filter(notif => !notif.isRead).length;

        set({ 
          notifications,
          unreadNotificationCount: unreadCount,
          isLoadingNotifications: false,
          notificationError: null
        });

        console.log(`📊 ${STORE_EVENTS.NOTIFICATIONS_LOAD} - ${notifications.length} notifications (${unreadCount} unread)`);
        return notifications;
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        set({ 
          isLoadingNotifications: false, 
          notificationError: 'Failed to load notifications' 
        });
        throw error;
      }
    },

    markNotificationAsRead: async (notificationId) => {
      try {
        // Optimistic update
        set(state => {
          const updatedNotifications = state.notifications.map(notif =>
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          );
          
          const unreadCount = updatedNotifications.filter(notif => !notif.isRead).length;
          
          return {
            notifications: updatedNotifications,
            unreadNotificationCount: unreadCount
          };
        });

        // API call to mark as read
        await api.patch(`/v1/notifications/${notificationId}/read`);
        
        console.log(`✅ Notification marked as read: ${notificationId}`);
      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        // Revert optimistic update
        get().fetchNotifications();
      }
    },

    markAllNotificationsAsRead: async () => {
      try {
        // Optimistic update
        set(state => ({
          notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
          unreadNotificationCount: 0
        }));

        // API call to mark all as read
        await api.patch('/v1/notifications/read-all');
        
        console.log('✅ All notifications marked as read');
      } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        // Revert optimistic update
        get().fetchNotifications();
      }
    },

    deleteNotification: async (notificationId) => {
      try {
        // Optimistic update
        const notificationToDelete = get().notifications.find(n => n.id === notificationId);
        
        set(state => {
          const updatedNotifications = state.notifications.filter(notif => notif.id !== notificationId);
          const unreadCount = updatedNotifications.filter(notif => !notif.isRead).length;
          
          return {
            notifications: updatedNotifications,
            unreadNotificationCount: unreadCount
          };
        });

        // API call to delete
        await api.delete(`/v1/notifications/${notificationId}`);
        
        console.log(`✅ Notification deleted: ${notificationId}`);
      } catch (error) {
        console.error('❌ Error deleting notification:', error);
        // Revert optimistic update
        get().fetchNotifications();
      }
    },

    onNotificationReceived: (notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationCount: notification.isRead 
          ? state.unreadNotificationCount 
          : state.unreadNotificationCount + 1
      }));

      console.log(`📊 ${STORE_EVENTS.NOTIFICATION_RECEIVED} - ${notification.id}`);
    },

    // Get notifications by type
    getNotificationsByType: (type) => {
      return get().notifications.filter(notif => notif.type === type);
    },

    // Get recent notifications (last 24 hours)
    getRecentNotifications: () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return get().notifications.filter(notif => 
        new Date(notif.createdAt) > oneDayAgo
      );
    },

    // ============ UTILITY ============
    clearAllData: () => {
      set({
        chatList: [],
        conversationMap: new Map(),
        selectedChatId: null,
        virtualChatUser: null,
        error: null,
        isLoadingChats: false,
        notifications: [],
        isLoadingNotifications: false,
        notificationError: null,
        unreadNotificationCount: 0,
      });
    },

    getChatByUserId: (userId) => get().conversationMap.get(userId),
    getSelectedChat: () => {
      const { selectedChatId, chatList } = get();
      return chatList.find(chat => chat.id === selectedChatId) || null;
    },

  }), {
    name: 'app-store'
  })
);

function getCurrentUserId() {
  return localStorage.getItem('userId') || null;
}

export default useAppStore;