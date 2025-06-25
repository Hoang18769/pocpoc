import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Event constants
export const STORE_EVENTS = {
  // Chat Events
  CHAT_LIST_LOAD: 'chat_list_load',
  CHAT_CREATED: 'chat_created', 
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  PROFILE_CHAT_CHECK: 'profile_chat_check',
  
  // Notification Events
  NOTIFICATION_LIST_LOAD: 'notification_list_load',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_CLEARED: 'notification_cleared',
  
  // NewsFeed Events
  NEWSFEED_LOAD: 'newsfeed_load',
  NEWSFEED_REFRESH: 'newsfeed_refresh',
  POST_CREATED: 'post_created',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented',
  POST_SHARED: 'post_shared',
  
  // User Activity Events
  USER_POSTS_LOAD: 'user_posts_load',
  MY_POSTS_UPDATED: 'my_posts_updated',
  
  // Search Events
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_HISTORY_UPDATED: 'search_history_updated'
};

const useAppStore = create(
  devtools((set, get) => ({
    // ============ CHAT STATE ============
    chatList: [],
    conversationMap: new Map(), // userId -> chatId mapping
    isLoadingChatList: false,
    lastChatFetch: null,
    
    // Chat Actions
    fetchChatList: async () => {
      set({ isLoadingChatList: true });
      try {
        const response = await fetch('/api/v1/chats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const chatList = await response.json();
        
        // Build conversation mapping
        const conversationMap = new Map();
        const currentUserId = getCurrentUserId(); // Your auth helper
        
        chatList.forEach(chat => {
          const otherUser = chat.participants?.find(p => p.id !== currentUserId);
          if (otherUser) {
            conversationMap.set(otherUser.id, chat.id);
          }
        });
        
        set({ 
          chatList, 
          conversationMap,
          isLoadingChatList: false,
          lastChatFetch: Date.now()
        });
        
        console.log(`📊 Event: ${STORE_EVENTS.CHAT_LIST_LOAD} - Loaded ${chatList.length} chats`);
      } catch (error) {
        console.error('❌ Error fetching chat list:', error);
        set({ isLoadingChatList: false });
      }
    },
    
    checkExistingChat: async (userId) => {
      // Check cache first
      const cached = get().conversationMap.get(userId);
      if (cached) {
        console.log(`💨 Cache hit for user ${userId}: ${cached}`);
        return { exists: true, chatId: cached };
      }
      
      try {
        const response = await fetch(`/api/v1/chats/check-existing?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        
        // Update cache if exists
        if (result.exists) {
          set(state => ({
            conversationMap: new Map(state.conversationMap).set(userId, result.chatId)
          }));
        }
        
        console.log(`📊 Event: ${STORE_EVENTS.PROFILE_CHAT_CHECK} - User ${userId}: ${result.exists ? 'exists' : 'new'}`);
        return result;
      } catch (error) {
        console.error('❌ Error checking existing chat:', error);
        return { exists: false, chatId: null };
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
      
      console.log(`📊 Event: ${STORE_EVENTS.CHAT_CREATED} - New chat: ${newChat.id}`);
    },
    
    onMessageReceived: (message) => {
      // Update chat list order (move to top)
      set(state => {
        const updatedChatList = state.chatList.map(chat => 
          chat.id === message.chatId 
            ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
            : chat
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        return { chatList: updatedChatList };
      });
      
      console.log(`📊 Event: ${STORE_EVENTS.MESSAGE_RECEIVED} - Chat: ${message.chatId}`);
    },
    
    // ============ NOTIFICATION STATE ============
    notifications: [],
    unreadNotificationCount: 0,
    isLoadingNotifications: false,
    lastNotificationFetch: null,
    
    // Notification Actions
    fetchNotifications: async (page = 1, limit = 20) => {
      set({ isLoadingNotifications: true });
      try {
        const response = await fetch(`/api/v1/notifications?page=${page}&limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        const unreadCount = data.notifications.filter(n => !n.isRead).length;
        
        set({ 
          notifications: page === 1 ? data.notifications : [...get().notifications, ...data.notifications],
          unreadNotificationCount: page === 1 ? unreadCount : get().unreadNotificationCount,
          isLoadingNotifications: false,
          lastNotificationFetch: Date.now()
        });
        
        console.log(`📊 Event: ${STORE_EVENTS.NOTIFICATION_LIST_LOAD} - Loaded ${data.notifications.length} notifications`);
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        set({ isLoadingNotifications: false });
      }
    },
    
    onNotificationReceived: (notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationCount: state.unreadNotificationCount + 1
      }));
      
      console.log(`📊 Event: ${STORE_EVENTS.NOTIFICATION_RECEIVED} - Type: ${notification.type}`);
    },
    
    onNotificationRead: (notificationId) => {
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1)
      }));
      
      console.log(`📊 Event: ${STORE_EVENTS.NOTIFICATION_READ} - ID: ${notificationId}`);
    },
    
    clearAllNotifications: () => {
      set({ notifications: [], unreadNotificationCount: 0 });
      console.log(`📊 Event: ${STORE_EVENTS.NOTIFICATION_CLEARED} - All cleared`);
    },
    
    // ============ NEWSFEED STATE ============
    newsFeed: [],
    isLoadingNewsFeed: false,
    newsFeedHasMore: true,
    lastNewsFeedFetch: null,
    
    // NewsFeed Actions
    fetchNewsFeed: async (page = 1, limit = 10) => {
      set({ isLoadingNewsFeed: true });
      try {
        const response = await fetch(`/api/v1/posts/feed?page=${page}&limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        set({ 
          newsFeed: page === 1 ? data.posts : [...get().newsFeed, ...data.posts],
          newsFeedHasMore: data.hasMore,
          isLoadingNewsFeed: false,
          lastNewsFeedFetch: Date.now()
        });
        
        const eventType = page === 1 ? STORE_EVENTS.NEWSFEED_REFRESH : STORE_EVENTS.NEWSFEED_LOAD;
        console.log(`📊 Event: ${eventType} - Loaded ${data.posts.length} posts`);
      } catch (error) {
        console.error('❌ Error fetching newsfeed:', error);
        set({ isLoadingNewsFeed: false });
      }
    },
    
    onPostCreated: (newPost) => {
      set(state => ({
        newsFeed: [newPost, ...state.newsFeed]
      }));
      
      console.log(`📊 Event: ${STORE_EVENTS.POST_CREATED} - Post: ${newPost.id}`);
    },
    
    onPostInteraction: (postId, type, data) => {
      set(state => ({
        newsFeed: state.newsFeed.map(post => 
          post.id === postId 
            ? { ...post, [type]: data }
            : post
        )
      }));
      
      const eventMap = {
        'likes': STORE_EVENTS.POST_LIKED,
        'comments': STORE_EVENTS.POST_COMMENTED,
        'shares': STORE_EVENTS.POST_SHARED
      };
      
      console.log(`📊 Event: ${eventMap[type]} - Post: ${postId}`);
    },
    
    // ============ USER POSTS STATE ============
    userPosts: new Map(), // userId -> posts[]
    isLoadingUserPosts: false,
    
    // User Posts Actions
    fetchUserPosts: async (userId, page = 1, limit = 10) => {
      set({ isLoadingUserPosts: true });
      try {
        const response = await fetch(`/api/v1/users/${userId}/posts?page=${page}&limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        set(state => {
          const userPosts = new Map(state.userPosts);
          const existingPosts = userPosts.get(userId) || [];
          userPosts.set(userId, page === 1 ? data.posts : [...existingPosts, ...data.posts]);
          
          return { 
            userPosts,
            isLoadingUserPosts: false
          };
        });
        
        console.log(`📊 Event: ${STORE_EVENTS.USER_POSTS_LOAD} - User: ${userId}, Posts: ${data.posts.length}`);
      } catch (error) {
        console.error('❌ Error fetching user posts:', error);
        set({ isLoadingUserPosts: false });
      }
    },
    
    // ============ SEARCH STATE ============
    searchHistory: [],
    recentSearches: [],
    maxSearchHistory: 10,
    
    // Search Actions
    onSearchPerformed: (query, results) => {
      set(state => {
        const newHistory = [
          { query, timestamp: Date.now(), resultCount: results.length },
          ...state.searchHistory.filter(h => h.query !== query)
        ].slice(0, state.maxSearchHistory);
        
        return { searchHistory: newHistory };
      });
      
      console.log(`📊 Event: ${STORE_EVENTS.SEARCH_PERFORMED} - Query: "${query}"`);
    },
    
    clearSearchHistory: () => {
      set({ searchHistory: [] });
      console.log(`📊 Event: ${STORE_EVENTS.SEARCH_HISTORY_UPDATED} - History cleared`);
    },
    
    // ============ UTILITY ACTIONS ============
    clearAllData: () => {
      set({
        chatList: [],
        conversationMap: new Map(),
        notifications: [],
        unreadNotificationCount: 0,
        newsFeed: [],
        userPosts: new Map(),
        searchHistory: [],
        recentSearches: []
      });
      console.log('🧹 All store data cleared');
    },
    
    // Get helpers (không trigger events)
    getChatByUserId: (userId) => get().conversationMap.get(userId),
    getUserPosts: (userId) => get().userPosts.get(userId) || [],
    getUnreadCount: () => get().unreadNotificationCount,
    
  }), {
    name: 'app-store' // DevTools name
  })
);

// Helper function - replace with your auth logic
function getCurrentUserId() {
  // Return current user ID from your auth system
  return localStorage.getItem('userId') || null;
}

export default useAppStore;