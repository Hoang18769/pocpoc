import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/utils/axios'; 

// Event constants
export const STORE_EVENTS = {
  CHAT_LIST_LOAD: 'chat_list_load',
  CHAT_CREATED: 'chat_created',
  MESSAGE_RECEIVED: 'message_received',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_LIST_LOAD: 'notification_list_load',
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

    // ============ NOTIFICATION STATE ============
    notificationsList: [],
    isLoadingNotifications: false,
    notificationError: null,
    unreadNotificationCount: 0,

    fetchNotifications: async (token) => {
      set({ isLoadingNotifications: true, notificationError: null });
      try {
        const res = await api.get('/v1/notifications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = res.data.body || [];
        const unreadCount = data.filter(notification => !notification.isRead).length;
        
        set({ 
          notificationsList: data,
          unreadNotificationCount: unreadCount,
          isLoadingNotifications: false,
          notificationError: null
        });

        console.log(`📊 ${STORE_EVENTS.NOTIFICATION_LIST_LOAD} - ${data.length} notifications, ${unreadCount} unread`);
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        set({ 
          isLoadingNotifications: false, 
          notificationError: 'Failed to load notifications' 
        });
      }
    },

    onNotificationReceived: (notification) => {
      set(state => {
        // Kiểm tra xem thông báo đã tồn tại chưa (tránh duplicate)
        const existingIndex = state.notificationsList.findIndex(n => n.id === notification.id);
        
        let updatedList;
        if (existingIndex !== -1) {
          // Cập nhật thông báo đã tồn tại
          updatedList = [...state.notificationsList];
          updatedList[existingIndex] = notification;
        } else {
          // Thêm thông báo mới vào đầu danh sách
          updatedList = [notification, ...state.notificationsList];
        }

        // Tính lại số thông báo chưa đọc
        const unreadCount = updatedList.filter(n => !n.isRead).length;

        return {
          notificationsList: updatedList,
          unreadNotificationCount: unreadCount
        };
      });

      console.log(`📊 ${STORE_EVENTS.NOTIFICATION_RECEIVED} - ${notification.id}`);
    },

    markNotificationAsRead: async (notificationId, token) => {
      try {
        await api.patch(`/v1/notifications/${notificationId}/read`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        set(state => {
          const updatedList = state.notificationsList.map(notification => 
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          );
          
          const unreadCount = updatedList.filter(n => !n.isRead).length;

          return {
            notificationsList: updatedList,
            unreadNotificationCount: unreadCount
          };
        });

        console.log(`✅ Notification marked as read: ${notificationId}`);
      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
      }
    },

    markAllNotificationsAsRead: async (token) => {
      try {
        await api.patch('/v1/notifications/read-all', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        set(state => ({
          notificationsList: state.notificationsList.map(notification => 
            ({ ...notification, isRead: true })
          ),
          unreadNotificationCount: 0
        }));

        console.log('✅ All notifications marked as read');
      } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
      }
    },

    clearNotifications: () => {
      set({
        notificationsList: [],
        unreadNotificationCount: 0,
        notificationError: null,
        isLoadingNotifications: false
      });
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

    // ============ UTILITY ============
    clearAllData: () => {
      set({
        chatList: [],
        conversationMap: new Map(),
        selectedChatId: null,
        virtualChatUser: null,
        error: null,
        isLoadingChats: false,
        // Clear notification data as well
        notificationsList: [],
        unreadNotificationCount: 0,
        notificationError: null,
        isLoadingNotifications: false
      });
    },

    getChatByUserId: (userId) => get().conversationMap.get(userId),
    getSelectedChat: () => {
      const { selectedChatId, chatList } = get();
      return chatList.find(chat => chat.id === selectedChatId) || null;
    },

    // Utility methods for notifications
    getUnreadNotifications: () => {
      const { notificationsList } = get();
      return notificationsList.filter(notification => !notification.isRead);
    },

    getNotificationById: (notificationId) => {
      const { notificationsList } = get();
      return notificationsList.find(notification => notification.id === notificationId);
    },

  }), {
    name: 'app-store'
  })
);

function getCurrentUserId() {
  return localStorage.getItem('userId') || null;
}

export default useAppStore;