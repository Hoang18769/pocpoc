import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/utils/axios'; 

// Event constants
export const STORE_EVENTS = {
  CHAT_LIST_LOAD: 'chat_list_load',
  CHAT_CREATED: 'chat_created',
  MESSAGE_RECEIVED: 'message_received',
  NOTIFICATION_RECEIVED: 'notification_received',
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
    
    fetchChatList: async () => {
      set({ isLoadingChats: true });
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
          isLoadingChats: false 
        });
        
        // console.log(`📊 ${STORE_EVENTS.CHAT_LIST_LOAD} - ${data.length} chats`);
        console.log(data);
      } catch (error) {
        console.error('❌ Error fetching chats:', error);
        set({ isLoadingChats: false });
      }
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
    
    onMessageReceived: (message) => {
      set(state => ({
        chatList: state.chatList
          .map(chat => chat.id === message.chatId 
            ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
            : chat
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      }));
      
      console.log(`📊 ${STORE_EVENTS.MESSAGE_RECEIVED} - ${message.chatId}`);
    },

    // ============ CHAT NAVIGATION & SELECTION LOGIC ============
    selectedChatId: null,
    virtualChatUser: null, // Để hiển thị virtual chat
    
    navigateToChat: (userId, userInfo = null) => {
      const { chatList } = get();
      
      // Kiểm tra existing chat bằng cách so sánh username từ userInfo với target.username trong chatList
      const existingChat = chatList.find(chat => 
        chat.target && chat.target.username === userInfo?.username
      );
      
      if (existingChat) {
        // Chat đã tồn tại, điều hướng đến chat với chatId
        console.log(`🚀 Navigating to existing chat: ${existingChat.chatId} with user: ${userId}`);
        return {
          type: 'existing',
          chatId: existingChat.chatId,
          userId: userId
        };
      } else {
        // Chat chưa tồn tại, tạo virtual chat
        console.log(`🚀 Creating virtual chat with user: ${userId}`);
        return {
          type: 'virtual',
          chatId: null,
          userId: userId,
          userInfo: userInfo
        };
      }
    },

    // Select existing chat
    selectChat: (chatId) => {
      set({ 
        selectedChatId: chatId,
        virtualChatUser: null // Clear virtual chat khi select real chat
      });
      console.log(`✅ Selected chat: ${chatId}`);
    },

    // Show virtual chat
    showVirtualChat: (userId, userInfo) => {
      set({ 
        selectedChatId: null, // Clear selected chat
        virtualChatUser: {
          id: userId,
          ...userInfo
        }
      });
      console.log(`✅ Showing virtual chat with user: ${userId}`);
    },

    // Clear chat selection
    clearChatSelection: () => {
      set({ 
        selectedChatId: null,
        virtualChatUser: null
      });
    },

    // Tạo chat mới khi gửi tin nhắn đầu tiên từ virtual chat
    createNewChat: async (userId, firstMessage) => {
      try {
        const res = await api.post('/v1/chat', {
          participantId: userId,
          message: firstMessage
        });
        
        if (res.data.code === 200) {
          const newChat = res.data.body;
          get().onChatCreated(newChat);
          
          // Sau khi tạo chat mới, select nó và clear virtual chat
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
    
    // ============ NOTIFICATION STATE ============
    // notifications: [],
    // unreadCount: 0,
    // isLoadingNotifications: false,
    
    // fetchNotifications: async (page = 1) => {
    //   set({ isLoadingNotifications: true });
    //   try {
    //     const { data } = await api.get(`/notifications?page=${page}&limit=20`);
    //     const unreadCount = data.notifications.filter(n => !n.isRead).length;
        
    //     set(state => ({ 
    //       notifications: page === 1 ? data.notifications : [...state.notifications, ...data.notifications],
    //       unreadCount: page === 1 ? unreadCount : state.unreadCount,
    //       isLoadingNotifications: false
    //     }));
        
    //     console.log(`📊 ${STORE_EVENTS.NOTIFICATION_RECEIVED} - ${data.notifications.length} notifications`);
    //   } catch (error) {
    //     console.error('❌ Error fetching notifications:', error);
    //     set({ isLoadingNotifications: false });
    //   }
    // },
    
    // onNotificationReceived: (notification) => {
    //   set(state => ({
    //     notifications: [notification, ...state.notifications],
    //     unreadCount: state.unreadCount + 1
    //   }));
      
    //   console.log(`📊 ${STORE_EVENTS.NOTIFICATION_RECEIVED} - ${notification.type}`);
    // },
    
    // // ============ NEWSFEED STATE ============
    // newsFeed: [],
    // isLoadingFeed: false,
    // hasMorePosts: true,
    
    // fetchNewsFeed: async (page = 1) => {
    //   set({ isLoadingFeed: true });
    //   try {
    //     const { data } = await api.get(`/posts/feed?page=${page}&limit=10`);
        
    //     set(state => ({ 
    //       newsFeed: page === 1 ? data.posts : [...state.newsFeed, ...data.posts],
    //       hasMorePosts: data.hasMore,
    //       isLoadingFeed: false
    //     }));
        
    //     console.log(`📊 ${STORE_EVENTS.NEWSFEED_LOAD} - ${data.posts.length} posts`);
    //   } catch (error) {
    //     console.error('❌ Error fetching feed:', error);
    //     set({ isLoadingFeed: false });
    //   }
    // },
    
    // onPostCreated: (newPost) => {
    //   set(state => ({ newsFeed: [newPost, ...state.newsFeed] }));
    //   console.log(`📊 ${STORE_EVENTS.POST_CREATED} - ${newPost.id}`);
    // },
    
    // updatePost: (postId, updates) => {
    //   set(state => ({
    //     newsFeed: state.newsFeed.map(post => 
    //       post.id === postId ? { ...post, ...updates } : post
    //     )
    //   }));
    // },
    
    // // ============ USER POSTS STATE ============
    // userPosts: new Map(),
    // isLoadingUserPosts: false,
    
    // fetchUserPosts: async (userId, page = 1) => {
    //   set({ isLoadingUserPosts: true });
    //   try {
    //     const { data } = await api.get(`/users/${userId}/posts?page=${page}&limit=10`);
        
    //     set(state => {
    //       const userPosts = new Map(state.userPosts);
    //       const existing = userPosts.get(userId) || [];
    //       userPosts.set(userId, page === 1 ? data.posts : [...existing, ...data.posts]);
          
    //       return { userPosts, isLoadingUserPosts: false };
    //     });
        
    //     console.log(`📊 User posts loaded - ${userId}: ${data.posts.length}`);
    //   } catch (error) {
    //     console.error('❌ Error fetching user posts:', error);
    //     set({ isLoadingUserPosts: false });
    //   }
    // },
    
    // // ============ SEARCH STATE ============
    // searchHistory: [],
    
    // onSearchPerformed: (query, results) => {
    //   set(state => ({
    //     searchHistory: [
    //       { query, timestamp: Date.now(), count: results.length },
    //       ...state.searchHistory.filter(h => h.query !== query)
    //     ].slice(0, 10)
    //   }));
      
    //   console.log(`📊 ${STORE_EVENTS.SEARCH_PERFORMED} - "${query}"`);
    // },
    
    // ============ UTILITY ============
    clearAllData: () => {
      set({
        chatList: [],
        conversationMap: new Map(),
        selectedChatId: null,
        virtualChatUser: null,
        notifications: [],
        unreadCount: 0,
        newsFeed: [],
        userPosts: new Map(),
        searchHistory: []
      });
    },
    
    // Getters
    getChatByUserId: (userId) => get().conversationMap.get(userId),
    getUserPosts: (userId) => get().userPosts.get(userId) || [],
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